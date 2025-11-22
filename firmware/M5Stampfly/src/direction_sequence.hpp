#include <cstdint>

typedef enum {
    FORWARD,
    RIGHT,
    LEFT,
    BACK,
    NORMAL,
    FLIP,
} Direction_t;

Direction_t direction_sequence[] = {RIGHT, FORWARD,BACK,LEFT,FLIP};

uint8_t MAX_STATES_NUM = sizeof(direction_sequence) / sizeof(direction_sequence[0]);
