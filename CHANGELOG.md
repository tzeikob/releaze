v1.0.0-alpha.0 - July 28, 2021
* [`aff9f1e`](https://github.com/tzeikob/releaze/commit/aff9f1e1d9e24e6e668a5ed73f5f1ac900ddd385) Create the changelog file
* [`85d26d2`](https://github.com/tzeikob/releaze/commit/85d26d213e399a96b45483378e1d02d5ee0511ff) Add a date next to the version in the changelog file (fixes #15)
* [`0c24d78`](https://github.com/tzeikob/releaze/commit/0c24d7889e8b4e9482f6d9860c00fcf45491bf5c) Report verbosely from within each op (fixes #12)
* [`65a623e`](https://github.com/tzeikob/releaze/commit/65a623ee6fcd99ac741c1806a19a35eee74bd89e) Enhance cli to report short progress in console
* [`a93d073`](https://github.com/tzeikob/releaze/commit/a93d0735b20fcd08ada0bdd961e71703f227169e) Add a specific method to logger for successful reports
* [`7923d09`](https://github.com/tzeikob/releaze/commit/7923d09ecde53b8d468158e295bff57412870215) Refactor tag op to return tag name and hash
* [`fe33d44`](https://github.com/tzeikob/releaze/commit/fe33d444391164b3089fa8397bd37ca9b323ddf5) Add logger module to handle loggings
* [`bd416c1`](https://github.com/tzeikob/releaze/commit/bd416c1382d863693c3b95f8fc46f5faf3fea831) Re-format package.json prop style
* [`53700b2`](https://github.com/tzeikob/releaze/commit/53700b2df6dbcd2dff9e16257fddf9ef29c0288a) Add use strict in every file (fixes #11)
* [`8f34b7e`](https://github.com/tzeikob/releaze/commit/8f34b7e73e686c891270306337ce4cdddd5fe03c) Add option to run testing before release (refs #12)
* [`8c4a5c6`](https://github.com/tzeikob/releaze/commit/8c4a5c662c1e75f9f6a88e139df53492759e341c) Suppress any console.log during testing
* [`4838464`](https://github.com/tzeikob/releaze/commit/483846488c425f3ca0910a5c11c9539c97c97cf2) Fix cli's broken exported method
* [`21c114c`](https://github.com/tzeikob/releaze/commit/21c114c063013a486da3c8e45eb9995925f774c1) Inject versions to changelog always in v{version} form
* [`a60fad9`](https://github.com/tzeikob/releaze/commit/a60fad9463662fefa9699a42e82dd8fb5615b03c) Extent cli to generate help and print version
* [`082514c`](https://github.com/tzeikob/releaze/commit/082514c28e5f58a40519a61dc8a5c2b30cfcb84e) Implement the cli module to launch via terminal (refs #12)
* [`b9d773c`](https://github.com/tzeikob/releaze/commit/b9d773ce574c42fa2a8590a93cf46cf374072437) Use relative paths in package.json file
* [`a09c3f6`](https://github.com/tzeikob/releaze/commit/a09c3f67ed41da90842aaefacd84506fb0c33ec0) Expose opes to use the module programmatically
* [`bbc5236`](https://github.com/tzeikob/releaze/commit/bbc52369f1675d765dba094d45001ee82e1440a6) Use validators as much as possible
* [`f0b2d7d`](https://github.com/tzeikob/releaze/commit/f0b2d7d03200f5d23730e85c8cebb363ffc1ca0d) Add tests to bump op to get full coverage
* [`fee273b`](https://github.com/tzeikob/releaze/commit/fee273b74302e987922a4b7d8b228c48cde9efaa) Add check op to validate all pre-conds are met (refs #12)
* [`56a4356`](https://github.com/tzeikob/releaze/commit/56a4356c2bf2ce667e406504bf4d37991b64864b) Organize operations into separate folder (fixes #18)
* [`e1409da`](https://github.com/tzeikob/releaze/commit/e1409da097e436dcbc549803261d14cfade08ffa) Refactor tag tests to be more dev friendly
* [`29b3d7d`](https://github.com/tzeikob/releaze/commit/29b3d7d8144b74fbb73b8659928e9ac0160c1b27) Refactor changelog op tests to be more dev friendly
* [`5c0b865`](https://github.com/tzeikob/releaze/commit/5c0b86525903e60f93c51527d1331d106664bc84) Move tests up-front for redability
* [`f8fdf68`](https://github.com/tzeikob/releaze/commit/f8fdf682baaf7c4b6367bdbfd97427874bd26601) Refactor log op to easy the passing from range op
* [`2c1a078`](https://github.com/tzeikob/releaze/commit/2c1a0782f94e6eecf2fdf89521cddae67a3c1609) Fix incorrect regular exps to match exact strings
* [`5f42ce9`](https://github.com/tzeikob/releaze/commit/5f42ce9693d0780eb8c5767a3936ddda3d1c5287) Refactor bump op to resolve the release type (refs #12)
* [`61324ce`](https://github.com/tzeikob/releaze/commit/61324ce73c803a792419f6bb103e8ea91005b6e7) Refactor range operation to return always the same schema
* [`5c1e70f`](https://github.com/tzeikob/releaze/commit/5c1e70f19794aaddf6d9202ef805ccadb8002b66) Move all jest.mock calls after require
* [`beeee60`](https://github.com/tzeikob/releaze/commit/beeee60d5ec82aed79dc055553f2d1defe93c204) Clean up the exec implementation
* [`3993e9e`](https://github.com/tzeikob/releaze/commit/3993e9e1e3b9155ebe4a18120734548b85547207) Use jest alias methods for readability
* [`b21f659`](https://github.com/tzeikob/releaze/commit/b21f65915710ab63e2a23f94b63069e601fe8f8a) Use mock implementations to be clear about the specs
* [`99a9db8`](https://github.com/tzeikob/releaze/commit/99a9db8e4e6d2d6383dfd6c9fb1f059e7bcc89f0) Mock readFile using async/await to follow the specs
* [`dafce32`](https://github.com/tzeikob/releaze/commit/dafce32ab4ed72dcbd582480228c4de89949cdd0) Refactor bump op test to be more dev friendly
* [`221a975`](https://github.com/tzeikob/releaze/commit/221a97546fd5abe34a1435be5765edc11a1f19b0) Shorten syntax by using jest alias methods
* [`a5e06ef`](https://github.com/tzeikob/releaze/commit/a5e06ef4b64cd5d6a5c18a87af4654403a8b4841) Drop custom Errors from the bump op
* [`7d7daff`](https://github.com/tzeikob/releaze/commit/7d7daff6144b89e586dcbb78672278475aa7a24b) Use relative to the current project folder paths
* [`affd960`](https://github.com/tzeikob/releaze/commit/affd960d19944c3d9915542e579c87b529ddc397) Simplify the tag op specs
* [`c9d1540`](https://github.com/tzeikob/releaze/commit/c9d1540960b2e391e4416d1c5d606aef265c55b1) Avoid resolving file paths via process.cwd
* [`a0b593e`](https://github.com/tzeikob/releaze/commit/a0b593e60fa4edd38d4157d7de150d44b6162755) Fix jest cli to look up only in test folder
* [`86c025e`](https://github.com/tzeikob/releaze/commit/86c025ed09fc766b4b57599a93d4243d20bd12a7) Add blank lines for readability
* [`b243e1b`](https://github.com/tzeikob/releaze/commit/b243e1bc73dac073ff94e0a460a4104fd0706eb1) Isolate empty string assertion for isNotString
* [`01e0fe8`](https://github.com/tzeikob/releaze/commit/01e0fe87e2d9e201671146a5be2a0980cfeae141) Add test assertions with falsy values for isGiven
* [`6abd3c3`](https://github.com/tzeikob/releaze/commit/6abd3c3cec3d8288aae94cfbe5f9bd897026d786) Move jest.mock after require and let hoisting take care
* [`0d18846`](https://github.com/tzeikob/releaze/commit/0d1884679e8042e99cc417cc55b903d9c0923785) Use alias matchers to assert mock function calls
* [`c2255d2`](https://github.com/tzeikob/releaze/commit/c2255d219253af06e6d1a919aff458b88f1445de) Add test badge in the README file
* [`e1ddf48`](https://github.com/tzeikob/releaze/commit/e1ddf48b549cfdb2a47e8fdf6cf550be678d5ea3) Refactor tag op test suite for readability
* [`73f32f9`](https://github.com/tzeikob/releaze/commit/73f32f9fe673d47d60c8c9e4f1596588a8d9ca4c) Remove jest-when dependency
* [`790b42d`](https://github.com/tzeikob/releaze/commit/790b42d0a07adecffd2154783da3d62bde3808ec) Fix exec test to mock a real world use case
* [`7a06ec0`](https://github.com/tzeikob/releaze/commit/7a06ec05b989c999ed18b114463b48258179a695) Add tag op to stage, commit and tag the release changes (refs #12)
* [`4f79cba`](https://github.com/tzeikob/releaze/commit/4f79cbaea820b29c54cae27d95e486e1d48c9cd6) Refactor tag op tests to be team across readable
* [`749ca3d`](https://github.com/tzeikob/releaze/commit/749ca3d76be253f781cff593e2a2c4f6a9d2e46d) Implement an async/await compatible version of execFile
* [`b170642`](https://github.com/tzeikob/releaze/commit/b170642a99d8355929323d0ce783c1dfa1d4cca6) Add more validators in the local util module
* [`32661da`](https://github.com/tzeikob/releaze/commit/32661da93f5e1870cfa624dd67092cce6146145a) Move assert to the corresponding isNotHashOrTag test
* [`16bc87e`](https://github.com/tzeikob/releaze/commit/16bc87e960bbcb3b129db7cf023310bc3ca1f402) Organize code in tag operation tests
* [`7167a2c`](https://github.com/tzeikob/releaze/commit/7167a2c87dbf9255ff69bda65c06cdf5431e06ce) Fix broken jest path to match only test files
* [`52cbada`](https://github.com/tzeikob/releaze/commit/52cbada2c58daba544c58aefbb8c1203a235e205) Restrict log op test to assert correct call
* [`28df67c`](https://github.com/tzeikob/releaze/commit/28df67ce303dfd8a43bfdc2bfe2ae7196c110c8f) Add tests for the upcomming tag op (ref #12)
* [`dbb5432`](https://github.com/tzeikob/releaze/commit/dbb5432392a30d2c5ff6e77994e0df62cedb02ad) Test log op to reject within no git repositories
* [`82e04a6`](https://github.com/tzeikob/releaze/commit/82e04a6945d3de3351c9b3001985a6e06422d193) Fix bump op to return cleaned semver versions
* [`e0bcd7d`](https://github.com/tzeikob/releaze/commit/e0bcd7d97f7b3ad7ed056c288022ae600ff5f2d9) Rename variables in changelog op for readability
* [`6aacd81`](https://github.com/tzeikob/releaze/commit/6aacd817b2b87517175c4d60877c081dab1b3e85) Add changelog op to build the CHANGELOG.md (refs #12)
* [`46ce603`](https://github.com/tzeikob/releaze/commit/46ce6032dca39c22c93eb14278e6253ffc2bbef4) Fix minor typo
* [`2bd2835`](https://github.com/tzeikob/releaze/commit/2bd28355b854eb3e631a5cdb154456c63b9e3a7a) Add a missing range notation test case for log op
* [`54ff0cd`](https://github.com/tzeikob/releaze/commit/54ff0cd4581a8b7a44a897cf594beb14e525cc35) Restrict bump release types to lowercase only
* [`d41ab22`](https://github.com/tzeikob/releaze/commit/d41ab22c35960cd72389d19f096d910c83c9dbbd) Accept alias HEAD as input to the log op
* [`7f1113c`](https://github.com/tzeikob/releaze/commit/7f1113c4255521ec36c55a5565c0a0314aac9ce3) Exclude merge commits from the log operation
* [`d14ef04`](https://github.com/tzeikob/releaze/commit/d14ef0442a9969eca2be7086259e7a46d0eb6867) Throw custom errors in the log operation
* [`6fac77b`](https://github.com/tzeikob/releaze/commit/6fac77bbeaef8fc76d41f35a202eedf5705bce66) Set invalid prerelease arg as error context
* [`81ad3fb`](https://github.com/tzeikob/releaze/commit/81ad3fb42a2818130baef37f6e421b25e6190e6f) Refactor log tests to assert every await call
* [`3b5b25f`](https://github.com/tzeikob/releaze/commit/3b5b25f88e2334cb247d9958759fd063dd5bed4d) Refactor log tests to assert with toThrow instead
* [`528bd51`](https://github.com/tzeikob/releaze/commit/528bd51384a42eb2d631004f8809a4082a254442) Rename the git log operation to simple log
* [`4d91ca0`](https://github.com/tzeikob/releaze/commit/4d91ca082cb8fe5699d624b5c8578d14fe4e3a51) Add more tests to the range operation (refs #12)
* [`eb142d0`](https://github.com/tzeikob/releaze/commit/eb142d03c781868efee0fd109f555e2fffe6e59d) Add operation to calc the tag range up to the HEAD (refs #12)
* [`636526d`](https://github.com/tzeikob/releaze/commit/636526d0960299d264a11857a222c90d4cc326e4) Test bump to reject for failed lock and shrink writes
* [`45ca3e7`](https://github.com/tzeikob/releaze/commit/45ca3e7824d90250d8d0337a32332db70cbbb49b) Refactor bump to ignore missing lock and shrink files
* [`099c112`](https://github.com/tzeikob/releaze/commit/099c112591262864180ac4370b543dddc2138dce) Rename regular expression var for readability
* [`d3404ce`](https://github.com/tzeikob/releaze/commit/d3404ce33c43ed7e7ea0d54ecd9b18241b1ee2fb) Extend bump to support pre release increments (refs #12)
* [`6d5238a`](https://github.com/tzeikob/releaze/commit/6d5238aa414c91f4ea1135ff64bd92826525b8da) Split bump resolving test per release type
* [`5bdf1da`](https://github.com/tzeikob/releaze/commit/5bdf1dad03995b030f86bf6a7fad52dfffb35aef) Clean bump tests to be atomic and less granular
* [`a72993a`](https://github.com/tzeikob/releaze/commit/a72993a6d0911d6b6da4911d0885157303707948) Refactor bump op to use custom errors
* [`4b37c2a`](https://github.com/tzeikob/releaze/commit/4b37c2aa9a48df454b9507e5583ab8d952ccc24a) Refactor bump operation to avoid DRY code
* [`7057bcb`](https://github.com/tzeikob/releaze/commit/7057bcb3365633afb927518425601d277becb20d) Fix bump to update also lock and shrinkwrap (fixes #13)
* [`7e3968f`](https://github.com/tzeikob/releaze/commit/7e3968fab1344fb847c3103cb642c0b75393d1de) Complete the code to bump operation to pass tests (refs #12)
* [`b998ab9`](https://github.com/tzeikob/releaze/commit/b998ab9da97d71c61e3b33f1d7042c70c32d7f73) Add more bump tests for error handling (refs #12)
* [`6bed330`](https://github.com/tzeikob/releaze/commit/6bed330ca7874a772ebc2bc71bd36479abec39e7) Rename to self explanatory names for readability
* [`4d1f9ca`](https://github.com/tzeikob/releaze/commit/4d1f9ca1f0b1407d2eaafc4c259cf41321d0b86a) Add very first test specs for bump operation (refs #12)
* [`8828361`](https://github.com/tzeikob/releaze/commit/8828361dcf5119ef60c681241e2f2a94f8a79b32) Replace cli dependency with optionator (fixes #9)
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