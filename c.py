def parse_input():
    N = int(input())
    slides = []
    for _ in range(N):
        x1, y1, x2, y2 = map(int, input().split())
        slides.append(((x1, y1), (x2, y2)))
    sx, sy, energy = map(int, input().split())
    return slides, (sx, sy), energy

def point_on_slide(px, py, slide):
    (x1, y1), (x2, y2) = slide
    if abs(x2 - x1) != abs(y2 - y1):
        return False
    min_x, max_x = min(x1, x2), max(x1, x2)
    min_y, max_y = min(y1, y2), max(y1, y2)
    if (px >= min_x and px <= max_x) and (py >= min_y and py <= max_y):
        # Check if the (px, py) truly lies on the slide's line
        return abs(px - x1) == abs(py - y1)
    return False

def find_slide(px, py, slides):
    for slide in slides:
        if point_on_slide(px, py, slide):
            return slide
    return None

def slide_direction(slide):
    (x1, y1), (x2, y2) = slide
    dx = 1 if x2 > x1 else -1
    dy = 1 if y2 > y1 else -1
    return dx, dy

def is_stuck(px, py, slides):
    return sum(point_on_slide(px, py, slide) for slide in slides) > 1

def gravity_drop(px, py, slides):
    next_y = 0
    for slide in slides:
        (x1, y1), (x2, y2) = slide
        if min(x1, x2) <= px <= max(x1, x2):
            # Since slide is 45deg, for a given px, matched py on this slide is:
            # (px-x1) == (py-y1) or (px-x1) == -(py-y1)
            d = px - x1
            possible_pys = [y1 + d, y1 - d] # Both slopes
            for s_py in possible_pys:
                if (min(y1, y2) <= s_py <= max(y1, y2)) and (s_py < py and s_py >= next_y):
                    next_y = int(s_py)
    return next_y

def simulate(slides, start, energy):
    px, py = start
    while energy > 0:
        new_y = gravity_drop(px, py, slides)
        fall_distance = py - new_y
        if energy < fall_distance:
            py -= energy
            energy = 0
            break
        energy -= fall_distance
        py = new_y
        if py == 0:
            break
        while energy > 0:
            if is_stuck(px, py, slides):
                unlock_cost = px * py
                if energy < unlock_cost:
                    return px, py
                energy -= unlock_cost
            slide = find_slide(px, py, slides)
            if slide is None:
                break
            dx, dy = slide_direction(slide)
            npx, npy = px + dx, py + dy
            if not point_on_slide(npx, npy, slide):
                break
            px, py = npx, npy
            energy -= 1
    return px, py

def main():
    slides, start, energy = parse_input()
    x, y = simulate(slides, start, energy)
    print(f"{x} {y}")

if __name__ == "__main__":
    main()
