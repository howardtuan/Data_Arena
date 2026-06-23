module.exports = {
  testDir: ".",
  testMatch: /ui-check\.spec\.cjs/,
  timeout: 30000,
  workers: 1,
  use: {
    trace: "off",
    video: "off"
  }
};
