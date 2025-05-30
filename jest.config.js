export default {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },
    setupFilesAfterEnv: ["@testing-library/jest-dom"],
    setupFiles: ['./jest-setup.js'],
    testTimeout: 10000,
};