This script can be used to traverse the last _N_ days of CircleCI pipeline runs on the `master` branch and compile the frequency of integration test failures.

# Setup

1. While logged into to CircleCI, go to https://app.circleci.com/settings/user/tokens and create an API token.
2. Paste that token in `env.mjs`.
3. Install the dependencies with `npm install`.
4. Run the script with `node index.mjs`. You can change the number of days to look back in `env.mjs`. (90 days is the default, but that can take around 15 minutes to run.)
