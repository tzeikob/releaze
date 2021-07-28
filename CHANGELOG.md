v0.2.0 - June 15, 2021

* [`a2cd645`](https://github.com/tzeikob/releaze/commit/a2cd645942798bac6f53dbd688abc5356d5cb36a) Bump to v0.2.0
* [`3fc2fc4`](https://github.com/tzeikob/releaze/commit/3fc2fc44284f8ace842f68ad943b50988b9c18c1) Fix broken changelog signature (fixes #10)
* [`0d626d3`](https://github.com/tzeikob/releaze/commit/0d626d3b2c9420877454af19883f153f03b5734d) Restrict gitlog's range to hashes or semver tags (fixes #7)
* [`c74f99c`](https://github.com/tzeikob/releaze/commit/c74f99c13e3fe9cf013c0a3875ab1d65eb3fb8b7) Remove inclusive revision notations in gitlog (fixes #6)
* [`b750052`](https://github.com/tzeikob/releaze/commit/b75005240778dbc9a3111d7c97bf714244a8773a) Fix gitlog test specs to assert exclusive from (refs #6)
* [`925970f`](https://github.com/tzeikob/releaze/commit/925970f1a69300d3b82b1663b0507b110a5a9a0d) Refactor minor things in tests
* [`4ec99f7`](https://github.com/tzeikob/releaze/commit/4ec99f747f787984e7f7e94d56ef6309747b215f) Add final tests in gitlog suite (fixes #5)
* [`c71f64b`](https://github.com/tzeikob/releaze/commit/c71f64b6fc4c8b6ab40daa88ddce4b4fd7650897) Assert invalid input in gitlog is caught early (refs #5)
* [`e166b10`](https://github.com/tzeikob/releaze/commit/e166b109200340cb079fa9391c0fab52afe379af) Add tests for gitlog to assert error handling for execFile (refs #5)
* [`641cfb6`](https://github.com/tzeikob/releaze/commit/641cfb6ea574e8112658dfdc9ee04e369988a21a) Fix typo in the call of git log process
* [`c262349`](https://github.com/tzeikob/releaze/commit/c2623497807665b7cdd38eee4b8c68df5e985c57) Refactor gitlog to ease the mocking of its internals calls (refs #5)
* [`14688bc`](https://github.com/tzeikob/releaze/commit/14688bc01f8faad3163646b407ead42516e99148) Refactor gitlog input to comply with tests (refs #5)
* [`46a2975`](https://github.com/tzeikob/releaze/commit/46a2975d7d7a0ca4aae149f97ded59d1cfdba8c9) Organize unit tests within separate groups
* [`84e2fa8`](https://github.com/tzeikob/releaze/commit/84e2fa87d639cc34516403c650c7951e0fa3e296) Refactor gitlog to reduce the number of unit tests (refs #5)
* [`848af13`](https://github.com/tzeikob/releaze/commit/848af1349ecb7f0a8c0634466f4f23bf09643d48) Fix minor syntax and typos
* [`a97405c`](https://github.com/tzeikob/releaze/commit/a97405c914b640c2ad692050670a3a502e7c543e) Organize package json file for readability
* [`789c769`](https://github.com/tzeikob/releaze/commit/789c769e6ac41e8d373376f5ebe0b6e7fcdfc022) Test gitlog to throw error for any invalid range input (fixes #5)
* [`06efc08`](https://github.com/tzeikob/releaze/commit/06efc081e90ce37147f142b82486ae4bf80b5b01) Remove gitlog tests need mocking a git repo (refs #5)
* [`871647f`](https://github.com/tzeikob/releaze/commit/871647f65abecc708d87cf5dab99cb30a93d1581) Add minor badges in the readme file
* [`9d5755c`](https://github.com/tzeikob/releaze/commit/9d5755c5edc942b24cbc170eaf41d2ef8e47bbfc) Add travis config to automate CI builds
* [`a6c2ccc`](https://github.com/tzeikob/releaze/commit/a6c2ccc071be93206c92a7ebd2809df77fe053e7) Add unit tests for the gitlog operation (refs #5)
* [`7a0d02b`](https://github.com/tzeikob/releaze/commit/7a0d02b3face1157b954ba84a7547ad30a0520d4) Move gitlog to separate module to ease testing
* [`aca3f3a`](https://github.com/tzeikob/releaze/commit/aca3f3a409b975f8c8cbf459ea137bc18bc1f406) Extend gitlog to support optional template formats (#4)

v0.1.0 - June 2, 2021

* [`d6f9eef`](https://github.com/tzeikob/releaze/commit/d6f9eefae7b01ffbf6cce279089ba786a4ac4ac8) Update readme to confrom with the current features
* [`18c6775`](https://github.com/tzeikob/releaze/commit/18c6775a2aac0eff4d193971fd5894a54905baed) Extent gitlog function to support more complex ranges (#3)
* [`4295b40`](https://github.com/tzeikob/releaze/commit/4295b40371e9ddf58a440b5a5eeefd4d329cf68b) Refactor minor variable names for readabillity
* [`eee5fe0`](https://github.com/tzeikob/releaze/commit/eee5fe0efe69001f671063c0fbd68e1d61db486b) Improve gitlog function to handle std errors properly
* [`9aad1c4`](https://github.com/tzeikob/releaze/commit/9aad1c47e88f4cdf26b9f7f1384b5096de96a61a) Improve gitlog to return on non-zero codes
* [`086e45c`](https://github.com/tzeikob/releaze/commit/086e45c6230a8e7d228492b898533893b6f5edc8) Fix gitlog function to catch fatal errors (#2)
* [`428c87b`](https://github.com/tzeikob/releaze/commit/428c87bb4a7c09d0b321da3c57589964e773ec56) Refactor the internals of the changelog operation
* [`2de0420`](https://github.com/tzeikob/releaze/commit/2de0420440f19fa6019227d5cfd410996968f1f7) Rename package
* [`ad4ab50`](https://github.com/tzeikob/releaze/commit/ad4ab50f72b244481e19fb5ddcdc7c9ed46509b2) Remove changelog file until the first release
* [`ffe2b9e`](https://github.com/tzeikob/releaze/commit/ffe2b9ef2fdd97b26e568cecfc37292f740ac6ba) Update readme file to given installation instructions
* [`ab8623a`](https://github.com/tzeikob/releaze/commit/ab8623a91f9cb7f3de0301e222e0b219a3c11877) Add changelog file
* [`be9be88`](https://github.com/tzeikob/releaze/commit/be9be88330ef5fabb371bb46a173598ce9b4bea4) Add feature to print commit messages in dry run (#1)
* [`d668589`](https://github.com/tzeikob/releaze/commit/d668589e672f4362926bc4b8b55e65071d9dc561) Initiate project as NPM package
* [`36104bc`](https://github.com/tzeikob/releaze/commit/36104bc710391073776ecf82db0629fab408fb0b) Add git ignore file
* [`f486b4d`](https://github.com/tzeikob/releaze/commit/f486b4d21c9ee1dab2c39175a6056f8f999e9f56) Add NPM ignore file
* [`2abc5e7`](https://github.com/tzeikob/releaze/commit/2abc5e76c14e2904d22a84c983b113ac2b80f328) Add NPM configuration file
* [`f9ad1aa`](https://github.com/tzeikob/releaze/commit/f9ad1aa6509effd0acd73155afe15c4909fcc7a7) Add MIT license file
* [`beb57e4`](https://github.com/tzeikob/releaze/commit/beb57e49029c8d54dd50fbeead0845789e13d5e2) Add readme file