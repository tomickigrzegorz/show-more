module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "airbnb-base",
        "prettier"
    ],
    "plugins": ["prettier"],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "prettier/prettier": [
            "error",
            {
                "endOfLine": "auto"
            }
        ],
        "class-methods-use-this": "off",
        "quotes": [
            "error",
            "single"
        ],
        "linebreak-style": ["error", "windows"],
        "no-param-reassign": [
            2,
            {
                "props": false
            }
        ],
        "no-plusplus": [
            "error",
            {
                "allowForLoopAfterthoughts": true
            }
        ]
    }
};
