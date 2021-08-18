[![npm version](https://img.shields.io/npm/v/releaze)](https://www.npmjs.com/package/releaze)
[![downloads](https://img.shields.io/npm/dm/releaze)](https://www.npmjs.com/package/releaze)
[![tested-jest](https://img.shields.io/badge/tested-jest-brightgreen)](https://github.com/facebook/jest)
[![code-style](https://img.shields.io/badge/style-aargh-orange)](https://github.com/tzeikob/eslint-config-aargh)

# Releaze

Releaze is a tool for automating the process of releasing new versions of NPM packages following the [semver](https://semver.org/) notation. By now the tool supports the following features:

* Bump version in package and lock files
* Collect last committed changes via git logs
* Write or append changes to the `CHANGELOG.md` file
* Create a git annotation tag matching the bumped version

## How to install

In order to have the tool available in your system as executable, you have to install it globally like so:

```sh
npm install --global releaze
```

Another option is to install it as a development dependency in your project, like so:

```sh
npm install --save-dev releaze
```

Both ways will work fine, which option you choose depends only on the environment of the setup and your overall workflow.

## How to use

Assuming you have the tool installed globally, change to the directory of your project. Now let's say you have done with your changes and have them committed so your git working directory is clean. In case you want to release the next major stable version you can do so by executing the following command:

```sh
releaze --bump major
```

after successful execution you can see your project has bumped up to the next major stable version, by having the version in your package files (incl. lock files) updated, any committed changes collected since the last stable released version added to your `CHANGELOG.md` file and a new git annotation tag matching this new bumped version.

### Are all pre-conditions met?

The tool is implemented so to run a few pre-condition checks before it starts the release operation. If any of the following pre-conditions are not met the release will abort with an exit code:

* Valid NPM project with package.json
* Valid git repository
* A git repository with at least one commit
* A clean git working directory

## Where the changelog lines are coming from?

In order to keep the exact history of every change committed to the repository being under release, the tool is using the outcome of the `git log <range>` process. This way every commit belonging to the tree path bounded within the `range` will be included into the changelog file. Keep in mind that the `range` notation in computed internally with respect to the current version and the already created tags.

> Note that the tool is set to ignore any merge commits via the `--no-merges` option.

## Format lines in the changelog file

By default the tool is using a pretty standard style for each changelog line, the notation of which is based on the git log's [format](https://git-scm.com/docs/git-log#_pretty_formats). The actual style is `%h %s`, where `%h` is a placeholder for the short hash and `%s` a placeholder for the message either correspond to the commit the change line is about. You can see an example bellow:

```
v1.0.0 - July 4, 2021

c4c8000 Refactor changelog op to return metadata
0f322f4 Improve console reporting
...
```

In order to set your personal style you can use the `--format` option using any available git log placeholders. So let's say we want each line to start with the short hash of the commit anchored with the url pointing to the commit in the remote repository and followed by the commit message and the name of the author enclosed within a pair of parenthesis. You can do so by using the following command:

```
releaze --bump --changelog --format '[`%h`](https://url/commit/%H) %s (%an)'
```

The previous command gives us the following changelog style:

```
v1.0.0 - July 4, 2021

[`c4c8000`](http://url/commit/c4c8000da...) Refactor changelog op to return metadata (Jake)
[`0f322f4`](http://url/commit/0f322f454...) Improve console reporting (Jake)
...
```

## What are the options?

Below you can find an extended list of all options this tool is providing:

```
-b, --bump <type>
           The semver release type to bump the version by. Valid values are:
           major, minor, patch, premajor, preminor, prepatch, prerelease.

--preid <indentifier>
           An identifier to be used in case of a premajor, preminor, prepatch
           or prerelease release.

--changelog
          Use this option to write the release's changes in the CHANGELOG.md
          file, default is true.

--no-changelog
          Use this option to skip writing the release's changes to the changelog
          file.

-f, --format <string>
          The format to apply to each line in the changelog file, default is '%h %s'.
          For more format options see the official git log formatnotation. The option
          should always given along with the --changelog option.

--git
         Use this option to create a git annotation tag with a name matching
         the release version number, default is true.

--no-git
         Use this option to skip creating a git annotation tag.

-m, --message <string>
         The message which will be used both in git commit and tag, default
         is 'Bump to v%s' where %s is a placeholder for the version number.
         The option should always given along with the --git option.
         
-h, --help
         Prints a help report about the usage of the tool.

-v, --version
         Prints the version of the tool.

--verbose
         Use this option to print a verbose output per in operation.
```

## Publish a new release

Currently the tool is not supporting an option to automatically publish the new version to a public or private NPM registry, so after a successful execution you have to run the following npm command:

```sh
npm publish
```

In the case you are releasing in a pre-release channel you have to send the release in a separate tag, other than the default `latest` tag:

```sh
npm publish --tag next
```

where `next` could be any valid name (alpha, beta etc.), whatever makes sense in your case.

## How you can contribute

Well no contribution rules are set for the moment, so feel free to help on the following topics:

* Find bugs
* Suggest other features
* Write an article about it