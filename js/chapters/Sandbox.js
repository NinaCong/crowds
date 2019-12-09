SLIDES.push({
  chapter: "Sandbox",
  clear: true,

  add: [
    // The fullscreen simulation
    {
      type: "sim",
      x: 0,
      y: 0,
      fullscreen: true,
      network: {
        contagion: 0.25,
        peeps: [
          [669, 292, 1, 0.066],
          [888, 283, 0, 0.066],
          [951, 155, 0, 0.066],
          [570, 203, 0, 0.066],
          [718, 395, 0, 0.066],
          [802, 600, 0, 0.066],
          [930, 464, 0, 0.066],
          [763, 74, 0, 0.066],
          [516, 47, 0, 0.066],
          [671, 572, 0, 0.066],
          [421, 490, 0, 0.066],
          [523, 381, 0, 0.066],
          [379, 226, 0, 0.066]
          // [497, -235, 0, 0.024]
        ],
        connections: [
          [0, 1, 0],
          [8, 12, 0],
          [12, 3, 0],
          [3, 8, 0],
          [9, 10, 0]
        ]
      }
    },

    // The Sandbox UI
    {
      type: "box",
      x: 0,
      y: 0,
      sandbox: true
    },

    // Simulation UI
    {
      type: "box",
      x: 35,
      y: 400,
      sim_ui: "blue"
    },

    // Words
    {
      type: "box",
      text: "sandbox_caption",
      x: 660,
      y: 500,
      w: 300,
      h: 40,
      align: "right"
    }
  ]
});
