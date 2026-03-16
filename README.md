# 🧬 Conway's Game of Life

An optimized web-based implementation of the legendary cellular automaton devised by John Horton Conway. This "zero-player" simulation demonstrates how complex, organic patterns can emerge from a few simple, deterministic rules.

---

## The Digital Ecosystem 

The simulation operates on a two-dimensional grid of square **cells**. Each cell exists in one of two binary states:
* **Alive** (Populated)
* **Dead** (Unpopulated)

The fate of every cell is governed by its **Moore Neighborhood**—the eight cells immediately surrounding it (horizontal, vertical, and diagonal).

## 📜 The Laws of Nature

The simulation progresses in discrete time-steps called **ticks**. During each tick, the state of the entire grid is updated simultaneously based on four fundamental laws:

1.  **Isolation:** Any living cell with fewer than two living neighbors dies (underpopulation).
2.  **Stability:** Any living cell with two or three living neighbors survives into the next generation.
3.  **Overcrowding:** Any living cell with more than three living neighbors dies (overpopulation).
4.  **Genesis:** Any dead cell with exactly three living neighbors becomes a live cell (reproduction).

## Technical Implementation

Unlike basic implementations, this version focuses on computational efficiency:
* **Simultaneous Updates:** Uses a double-buffering approach to ensure the state of the current generation is not mutated while calculating the next.
* **Deterministic Logic:** Since there is no randomness, the "seed" (initial state) perfectly dictates the evolution of the system.
* **Performance:** Designed to handle high-frequency ticks for smooth, fluid visualization.

## Getting Started

1.  **The Seed:** Click on the grid to toggle cells and create your initial pattern.
2.  **Evolution:** Hit 'Start' to begin the simulation.
3.  **Observation:** Watch for "Still Lifes," "Oscillators," and "Spaceships" that emerge from the chaos.

---

##  Author
**Elias Joby**
*Computer Science & Robotics*

[Project Link](https://github.com/your-username/your-repo-name) | [Wikipedia Reference](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)