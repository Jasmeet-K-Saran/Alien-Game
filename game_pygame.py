"""
Alien Escapade: Customizable 2D Arcade Game (Python / Pygame Edition)
Multimedia Systems Lab — Lab Test 2

Run with:
    pip install pygame
    python game_pygame.py

Features:
- Procedural drawing (Alien, Coffee Cup, Urgent Email, Boss Zorg)
- Circle collision detection: math.hypot(dx, dy) < r1 + r2
- Continuous energy drain & burnout mechanic
- Start, Playing, Paused, and Game Over states
- Full CONFIG block for assigned lab customizations
"""

import math
import random
import sys

try:
    import pygame
except ImportError:
    print("Pygame is not installed. To run the Python version, run: pip install pygame")
    print("Alternatively, open index.html in any browser to run the HTML5 Canvas version!")
    sys.exit(0)

# ==============================================================================
# CONFIGURATION BLOCK (Lab Test Assigned Customizations)
# ==============================================================================
CONFIG = {
    "collectible": {
        "name": "Coffee Cup",
        "color": (0, 240, 255),       # Cyan
        "points": 10,
        "goldPoints": 50,
        "refill": 25,
        "goldRefill": 60
    },
    "hazard": {
        "name": "Urgent Email",
        "color": (255, 51, 102),      # Urgent Red
        "lifeLoss": 1,
        "scorePenalty": 5
    },
    "energyDrain": 3.0,               # Energy drain per second
    "powerup": "slow",                # 'slow', 'shield', or 'double'
    "difficulty": "both",             # 'speed', 'spawn', or 'both'
    "lives": 3,
    "pointsPerLevel": 100,
    "bossFromLevel": 2,
    "bossName": "Boss Zorg",
    "playerColor": (57, 255, 20)       # Neon Green
}

# Window dimensions
WIDTH, HEIGHT = 960, 540
FPS = 60

# Colors
COLOR_BG = (10, 15, 36)
COLOR_WHITE = (255, 255, 255)
COLOR_GOLD = (255, 190, 11)
COLOR_PURPLE = (157, 78, 221)
COLOR_DARK_PANEL = (15, 20, 45)


class AlienGame:
    def __init__(self):
        pygame.init()
        pygame.font.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("Alien Escapade — 2D Arcade Game")
        self.clock = pygame.time.Clock()

        # Fonts
        self.font_title = pygame.font.SysFont("Arial", 42, bold=True)
        self.font_ui = pygame.font.SysFont("Arial", 18, bold=True)
        self.font_stat = pygame.font.SysFont("Courier", 20, bold=True)

        # Starfield
        self.stars = [
            [random.randint(0, WIDTH), random.randint(30, HEIGHT - 30), random.choice([1, 2]), random.uniform(0.5, 1.5)]
            for _ in range(50)
        ]

        self.reset_game()
        self.state = "START"  # 'START', 'PLAY', 'PAUSE', 'OVER'

    def reset_game(self):
        self.score = 0
        self.level = 1
        self.lives = CONFIG["lives"]
        self.energy = 100.0
        self.coffee_count = 0
        self.emails_avoided = 0

        # Player
        self.player_x = 140
        self.player_y = HEIGHT // 2
        self.player_r = 22
        self.player_speed = 320
        self.invulnerable_frames = 0
        self.powerup_timer = 0.0

        # Entities
        self.items = []
        self.spawn_timer = 0
        self.boss = None
        self.game_time = 0.0

    def spawn_item(self):
        y = random.randint(60, HEIGHT - 60)
        roll = random.random()

        if roll < 0.40:
            # Coffee Cup
            self.items.append({"type": "coffee", "gold": False, "x": WIDTH + 30, "y": y, "r": 16, "vx": -180, "vy": 0})
        elif roll < 0.70:
            # Urgent Email (Sine wave)
            self.items.append({"type": "email", "x": WIDTH + 30, "y": y, "base_y": y, "r": 15, "vx": -210, "freq": 4.0, "amp": 25})
        elif roll < 0.82:
            # Double Espresso
            self.items.append({"type": "coffee", "gold": True, "x": WIDTH + 30, "y": y, "r": 20, "vx": -200, "vy": 0})
        elif roll < 0.94:
            # Guard Drone
            self.items.append({"type": "guard", "x": WIDTH + 35, "y": y, "r": 18, "vx": -160, "vy": random.choice([-50, 50])})
        else:
            # Day-Off Pass
            self.items.append({"type": "pass", "x": WIDTH + 30, "y": y, "r": 16, "vx": -190, "vy": 0})

    def check_collision(self, x1, y1, r1, x2, y2, r2):
        """Circle-Circle distance collision check"""
        return math.hypot(x1 - x2, y1 - y2) < (r1 + r2)

    def hurt(self, source):
        if self.invulnerable_frames > 0:
            return

        if source == "burnout":
            self.lives -= 1
            self.energy = 50.0
            self.invulnerable_frames = 90
        else:
            self.lives -= CONFIG["hazard"]["lifeLoss"]
            self.score = max(0, self.score - CONFIG["hazard"]["scorePenalty"])
            self.invulnerable_frames = 90

        if self.lives <= 0:
            self.state = "OVER"

    def update(self, dt):
        self.game_time += dt

        # Multipliers
        speed_mult = 1.0 + 0.15 * (self.level - 1) if CONFIG["difficulty"] in ("speed", "both") else 1.0
        if self.powerup_timer > 0 and CONFIG["powerup"] == "slow":
            speed_mult *= 0.5

        if self.powerup_timer > 0:
            self.powerup_timer -= dt

        # Player Movement
        keys = pygame.key.get_pressed()
        dx, dy = 0, 0
        if keys[pygame.K_UP] or keys[pygame.K_w]: dy -= 1
        if keys[pygame.K_DOWN] or keys[pygame.K_s]: dy += 1
        if keys[pygame.K_LEFT] or keys[pygame.K_a]: dx -= 1
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]: dx += 1

        if dx != 0 or dy != 0:
            dist = math.hypot(dx, dy)
            self.player_x += (dx / dist) * self.player_speed * dt
            self.player_y += (dy / dist) * self.player_speed * dt
        else:
            # Mouse follow fallback
            mx, my = pygame.mouse.get_pos()
            self.player_x += (mx - self.player_x) * 6 * dt
            self.player_y += (my - self.player_y) * 6 * dt

        # Clamp boundaries
        self.player_x = max(self.player_r + 10, min(WIDTH - self.player_r - 10, self.player_x))
        self.player_y = max(self.player_r + 30, min(HEIGHT - self.player_r - 30, self.player_y))

        if self.invulnerable_frames > 0:
            self.invulnerable_frames -= 1

        # Energy Drain
        drain = CONFIG["energyDrain"] * (1.0 + 0.1 * (self.level - 1))
        self.energy -= drain * dt
        if self.energy <= 0:
            self.energy = 0
            self.hurt("burnout")

        # Spawning
        base_gap = max(18, 55 - 6 * (self.level - 1)) if CONFIG["difficulty"] in ("spawn", "both") else 55
        self.spawn_timer += 1
        if self.spawn_timer >= base_gap:
            self.spawn_timer = 0
            self.spawn_item()

        # Update entities
        for item in self.items[:]:
            item["x"] += item["vx"] * speed_mult * dt
            if item["type"] == "email":
                item["y"] = item["base_y"] + math.sin(self.game_time * item["freq"]) * item["amp"]
            elif item["type"] == "guard":
                item["y"] += item["vy"] * dt
                if item["y"] < 40 or item["y"] > HEIGHT - 40:
                    item["vy"] *= -1

            if item["x"] < -40:
                if item["type"] == "email":
                    self.emails_avoided += 1
                self.items.remove(item)
                continue

            # Check collision with player
            if self.check_collision(self.player_x, self.player_y, self.player_r, item["x"], item["y"], item["r"]):
                if item["type"] == "coffee":
                    mult = 2 if (self.powerup_timer > 0 and CONFIG["powerup"] == "double") else 1
                    if item["gold"]:
                        self.score += CONFIG["collectible"]["goldPoints"] * mult
                        self.energy = min(100.0, self.energy + CONFIG["collectible"]["goldRefill"])
                    else:
                        self.score += CONFIG["collectible"]["points"] * mult
                        self.energy = min(100.0, self.energy + CONFIG["collectible"]["refill"])
                    self.coffee_count += 1
                    self.items.remove(item)
                elif item["type"] == "pass":
                    self.powerup_timer = 7.0
                    self.items.remove(item)
                elif item["type"] in ("email", "guard"):
                    if self.powerup_timer > 0 and CONFIG["powerup"] == "shield":
                        self.items.remove(item)
                    else:
                        self.hurt(item["type"])
                        self.items.remove(item)

        # Boss Zorg
        if self.level >= CONFIG["bossFromLevel"] and self.boss is None:
            self.boss = {"x": WIDTH + 60, "y": HEIGHT // 2, "r": 36, "speed": 120}

        if self.boss:
            bdx = self.player_x - self.boss["x"]
            bdy = self.player_y - self.boss["y"]
            bdist = math.hypot(bdx, bdy)
            if bdist > 1:
                bspeed = self.boss["speed"] * speed_mult
                self.boss["x"] += (bdx / bdist) * bspeed * dt
                self.boss["y"] += (bdy / bdist) * bspeed * dt

            if self.check_collision(self.player_x, self.player_y, self.player_r, self.boss["x"], self.boss["y"], self.boss["r"]):
                if not (self.powerup_timer > 0 and CONFIG["powerup"] == "shield"):
                    self.hurt("boss")

        # Level Progression
        new_level = (self.score // CONFIG["pointsPerLevel"]) + 1
        if new_level > self.level:
            self.level = new_level

        # Stars
        for star in self.stars:
            star[0] -= star[3] * speed_mult * 60 * dt
            if star[0] < 0:
                star[0] = WIDTH
                star[1] = random.randint(30, HEIGHT - 30)

    def draw(self):
        self.screen.fill(COLOR_BG)

        # Draw Starfield
        for star in self.stars:
            pygame.draw.circle(self.screen, (180, 200, 255), (int(star[0]), int(star[1])), star[2])

        # Architectural conduits
        pygame.draw.line(self.screen, (0, 240, 255), (0, 24), (WIDTH, 24), 2)
        pygame.draw.line(self.screen, (0, 240, 255), (0, HEIGHT - 24), (WIDTH, HEIGHT - 24), 2)

        # Draw Items
        for item in self.items:
            ix, iy, ir = int(item["x"]), int(item["y"]), int(item["r"])
            if item["type"] == "coffee":
                color = COLOR_GOLD if item["gold"] else CONFIG["collectible"]["color"]
                pygame.draw.circle(self.screen, color, (ix, iy), ir)
                pygame.draw.circle(self.screen, COLOR_WHITE, (ix, iy), ir, 2)
            elif item["type"] == "email":
                pygame.draw.rect(self.screen, CONFIG["hazard"]["color"], (ix - ir, iy - ir // 2, ir * 2, ir), border_radius=3)
                pygame.draw.line(self.screen, COLOR_WHITE, (ix - ir, iy - ir // 2), (ix, iy), 2)
                pygame.draw.line(self.screen, COLOR_WHITE, (ix + ir, iy - ir // 2), (ix, iy), 2)
            elif item["type"] == "guard":
                pygame.draw.circle(self.screen, (45, 27, 78), (ix, iy), ir)
                pygame.draw.circle(self.screen, (168, 85, 247), (ix, iy), ir, 2)
                pygame.draw.circle(self.screen, (239, 68, 68), (ix, iy), ir // 3)
            elif item["type"] == "pass":
                pygame.draw.circle(self.screen, (56, 189, 248), (ix, iy), ir)
                pygame.draw.circle(self.screen, COLOR_WHITE, (ix, iy), ir, 2)

        # Draw Boss Zorg
        if self.boss:
            bx, by, br = int(self.boss["x"]), int(self.boss["y"]), int(self.boss["r"])
            pygame.draw.circle(self.screen, COLOR_PURPLE, (bx, by), br)
            pygame.draw.circle(self.screen, (255, 0, 85), (bx - 10, by - 6), 5)
            pygame.draw.circle(self.screen, (255, 0, 85), (bx + 10, by - 6), 5)
            # Necktie
            pygame.draw.polygon(self.screen, (220, 38, 38), [(bx - 4, by + 4), (bx + 4, by + 4), (bx, by + 22)])

        # Draw Player Alien
        if self.invulnerable_frames == 0 or (self.invulnerable_frames // 6) % 2 == 0:
            px, py, pr = int(self.player_x), int(self.player_y), int(self.player_r)
            if self.powerup_timer > 0 and CONFIG["powerup"] == "shield":
                pygame.draw.circle(self.screen, (0, 240, 255), (px, py), pr + 10, 2)
            pygame.draw.circle(self.screen, CONFIG["playerColor"], (px, py), pr)
            # 3 Eyes
            for ex in (-8, 0, 8):
                pygame.draw.circle(self.screen, COLOR_WHITE, (px + ex, py - 4), 5)
                pygame.draw.circle(self.screen, (10, 15, 30), (px + ex, py - 4), 2)
            # Necktie
            pygame.draw.polygon(self.screen, (229, 62, 62), [(px - 3, py + 6), (px + 3, py + 6), (px, py + 18)])

        # Draw HUD
        self.draw_hud()

        # Overlay Screens
        if self.state == "START":
            self.draw_overlay("ALIEN ESCAPADE", "Press SPACE or Enter to Start", "WASD / Mouse to move | P to Pause")
        elif self.state == "PAUSE":
            self.draw_overlay("GAME PAUSED", "Press P to Resume", "Take a cosmic breath!")
        elif self.state == "OVER":
            self.draw_overlay("WORKDAY TERMINATED", f"Final Score: {self.score} | Level: {self.level}", "Press SPACE to Play Again")

        pygame.display.flip()

    def draw_hud(self):
        # Score & Level
        score_surf = self.font_ui.render(f"SCORE: {self.score}", True, (0, 240, 255))
        level_surf = self.font_ui.render(f"LEVEL: {self.level}", True, COLOR_WHITE)
        lives_surf = self.font_ui.render(f"LIVES: {'👽 ' * self.lives}", True, (57, 255, 20))
        self.screen.blit(score_surf, (20, 8))
        self.screen.blit(level_surf, (150, 8))
        self.screen.blit(lives_surf, (260, 8))

        # Energy Bar
        energy_pct = max(0, min(100, self.energy))
        bar_w = 200
        pygame.draw.rect(self.screen, (30, 40, 70), (WIDTH // 2 - bar_w // 2, 8, bar_w, 14), border_radius=4)
        bar_color = (57, 255, 20) if energy_pct > 40 else (255, 190, 11) if energy_pct > 20 else (255, 51, 102)
        pygame.draw.rect(self.screen, bar_color, (WIDTH // 2 - bar_w // 2, 8, int(bar_w * (energy_pct / 100)), 14), border_radius=4)
        energy_text = self.font_ui.render(f"ENERGY: {int(energy_pct)}%", True, COLOR_WHITE)
        self.screen.blit(energy_text, (WIDTH // 2 - bar_w // 2 + 35, 24))

        if self.powerup_timer > 0:
            pu_text = self.font_ui.render(f"POWERUP: {self.powerup_timer:.1f}s", True, COLOR_GOLD)
            self.screen.blit(pu_text, (WIDTH - 180, 8))

    def draw_overlay(self, title, sub1, sub2):
        overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        overlay.fill((6, 9, 22, 210))
        self.screen.blit(overlay, (0, 0))

        t_surf = self.font_title.render(title, True, (0, 240, 255))
        s1_surf = self.font_ui.render(sub1, True, COLOR_WHITE)
        s2_surf = self.font_ui.render(sub2, True, (140, 154, 196))

        self.screen.blit(t_surf, (WIDTH // 2 - t_surf.get_width() // 2, HEIGHT // 2 - 60))
        self.screen.blit(s1_surf, (WIDTH // 2 - s1_surf.get_width() // 2, HEIGHT // 2 + 10))
        self.screen.blit(s2_surf, (WIDTH // 2 - s2_surf.get_width() // 2, HEIGHT // 2 + 40))

    def run(self):
        while True:
            dt = self.clock.tick(FPS) / 1000.0

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.KEYDOWN:
                    if event.key in (pygame.K_SPACE, pygame.K_RETURN):
                        if self.state == "START":
                            self.state = "PLAY"
                        elif self.state == "OVER":
                            self.reset_game()
                            self.state = "PLAY"
                    elif event.key == pygame.K_p:
                        if self.state == "PLAY":
                            self.state = "PAUSE"
                        elif self.state == "PAUSE":
                            self.state = "PLAY"

            if self.state == "PLAY":
                self.update(dt)

            self.draw()


if __name__ == "__main__":
    game = AlienGame()
    game.run()
