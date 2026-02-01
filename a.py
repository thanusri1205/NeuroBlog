from collections import deque
import sys

def calc_min_seats(reservations):
    num_orders = len(reservations)
    if num_orders == 0:
        return 0

    entries = []
    for eid, (arr, stay, is_vip) in enumerate(reservations):
        entries.append({'arrive': arr, 'length': stay, 'vip_flag': is_vip, 'eid': eid})
    entries.sort(key=lambda x: x['arrive'])

    next_idx = 0
    active_time = entries[0]['arrive']
    vip_line = deque()
    reg_line = deque()
    begin_times = [None] * num_orders
    finished = 0

    while finished < num_orders:
        while next_idx < num_orders and entries[next_idx]['arrive'] <= active_time:
            batch_stamp = entries[next_idx]['arrive']
            curr_batch = []
            while next_idx < num_orders and entries[next_idx]['arrive'] == batch_stamp:
                curr_batch.append(entries[next_idx])
                next_idx += 1

            vip_now = sorted([e for e in curr_batch if e['vip_flag']], key=lambda x: x['length'])
            reg_now = sorted([e for e in curr_batch if not e['vip_flag']], key=lambda x: x['length'])
            for e in vip_now:
                vip_line.append(e)
            for e in reg_now:
                reg_line.append(e)

        if not vip_line and not reg_line:
            if next_idx < num_orders:
                active_time = entries[next_idx]['arrive']
            continue

        if vip_line:
            e = vip_line.popleft()
        else:
            e = reg_line.popleft()

        begin_times[e['eid']] = active_time
        active_time += e['length']
        finished += 1

    event_track = []
    for eid, (arr, stay, is_vip) in enumerate(reservations):
        b_start = begin_times[eid]
        if b_start > arr:
            event_track.append((arr, 1))
            event_track.append((b_start, -1))
    event_track.sort(key=lambda x: (x[0], x[1]))

    running = 0
    max_seats = 0
    for _, signal in event_track:
        running += signal
        max_seats = max(max_seats, running)

    return max_seats


if __name__ == "__main__":
    raw = sys.stdin.read().split()
    n = int(raw[0])
    requests = []
    for j in range(n):
        arr = int(raw[3 * j + 1])
        stay = int(raw[3 * j + 2])
        vip_flag = int(raw[3 * j + 3])
        requests.append((arr, stay, vip_flag))

    response = calc_min_seats(requests)
    sys.stdout.write(str(response))
