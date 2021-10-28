# Contributing

## Workflow

1. Fork and clone this repository.
2. Create a new branch in your fork based off the **main** branch.
3. Make your changes, and push them.
4. Submit a Pull Request [here](https://github.com/eslachance/josh/pulls)!

## Contributing to the code

**The issue tracker is only for issue reporting or proposals/suggestions. If you have a question, you can find us in our [Discord Server](https://discord.gg/N7ZKH3P)**.

To contribute to this repository, feel free to create a new fork of the repository and submit a pull request. We highly suggest [ESLint](https://eslint.org) to be installed in your text editor or IDE of your choice to ensure builds from GitHub Actions do not fail.

**_Before committing and pushing your changes, please ensure that you do not have any linting errors by running `yarn lint`!_**

### Josh Concept Guidelines

There are a number of guidelines considered when reviewing Pull Requests to be merged. _This is by no means an exhaustive list, but here are some things to consider before/while submitting your ideas._

- Everything in Josh should be generally useful for the majority of users. Don't let that stop you if you've got a good concept though, as your idea still might be a great addition.
- Everything should follow [OOP paradigms](https://en.wikipedia.org/wiki/Object-oriented_programming) and generally rely on behavior over state where possible. This abstraction, and leads to efficiency and therefore scalability.
- Everything should follow our ESLint rules as closely as possible, and should pass lint tests even if you must disable a rule for a single line.
- Scripts that are to be ran outside of the scope source files should be added to [scripts](/scripts) directory and should be in the `mjs` file format.
