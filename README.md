# Verzion

This is an experimental cli package to be used as utility for release side tasks.

## How to install

In order to instal you can use NPM like so:

```sh
npm install verzion
```

## How to use

Assuming you have installed the cli package in a git NPM/Node repository.

Being in the project's root folder, you can print all the commit messages by running the following command.

```sh
verzion changelog
```

Another option could be to define a hash range within each commit should fall in, like so.

```sh
verzion changelog --from <hash or tag> --to <hash or tag>
```

## Get help

You can always get more information about the usage and options applied to the client.

```sh
verzion --help
```