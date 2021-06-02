# Releaze

This is an experimental package to be used as utility for side tasks related to releasing and publishing new versions.

## How to install

In order to instal the package globally you should execute the following command:

```sh
npm install -g releaze
```

## How to use

Assuming you have installed the package globally, change to the directory of your git repository. Being in the project's root folder, you can print all the commit messages by running the following command:

```sh
releaze changelog
```

this command will print every commit message from your git repository in the following format:

```
...
e8a36dd Reorganize package properties plus various demographics
880a599 Set the version and environment of the ES
371664a First commit

Wow, that was a DRY output of 103 commits!

```

### Limit commits in a given range

Another use case could be to limit the range of commits given a starting and ending point. The starting point should be given via the argument `from` and the end point via the argument `to`, both arguments is expected to be a commit hash or a git tag.

```sh
releaze changelog --from <hash or tag> --to <hash or tag>
```

Bear in mind that you don't have to provided both arguments, you can use for instance only the `from` where the commit range should be limited to those starting from the given hash or tag otherwise you can use only the `to` argument to print only the commits up to the given has or tag.

## Get help

You can always get more information about the usage and options applied to the client.

```sh
releaze --help
```