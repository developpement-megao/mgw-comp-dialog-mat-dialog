// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const eslintPluginMgwEslintRules = require("eslint-plugin-mgw-eslint-rules");
const eslintPluginImport = require("eslint-plugin-import");
const eslintPluginNode = require("eslint-plugin-n");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintPluginPrettierRecommended,
      eslintPluginImport.flatConfigs.recommended,
      eslintPluginImport.flatConfigs.typescript
    ],
    plugins: {
      'mgw-eslint-rules': eslintPluginMgwEslintRules,
      n: eslintPluginNode
    },
    settings: {
      "import/resolver": {
        typescript: {},
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs']
        }
      }
    },
    ignores: ["**/*.spec.ts"],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["app", "lib"],
          style: "kebab-case",
        },
      ],
      "@angular-eslint/component-max-inline-declarations": [
          "warn",
          {
            template: 7,
            styles: 15,
            animations: 25
          }
      ],
      "@angular-eslint/no-input-prefix": [
        "warn",
        {
          prefixes: ["on"]
        }
      ],
      "@angular-eslint/require-localize-metadata": [
        "warn",
        {
          requireDescription: true
        }
      ],
      "@angular-eslint/sort-keys-in-type-decorator": [
        "warn",
        {
          "Component": [
            "selector",
            "standalone",
            "changeDetection",
            "encapsulation",
            "imports",
            "providers",
            "viewProviders",
            "host",
            "hostDirectives",
            "inputs",
            "outputs",
            "animations",
            "templateUrl",
            "template",
            "styleUrl",
            "styleUrls",
            "styles",
            "schemas",
            "exportAs",
            "queries",
            "preserveWhitespaces",
            "jit",
            "moduleId",
            "interpolation"
          ]
        }
      ],
      "@typescript-eslint/array-type": [
        "warn",
        {
          default: "array-simple",
          readonly: "generic"
        }
      ],
      "class-methods-use-this": "off",
      "@typescript-eslint/class-methods-use-this": [
        "warn",
        {
          ignoreClassesThatImplementAnInterface: 'public-fields',
          exceptMethods: [
            "noKeyvalueSort"
          ]
        }
      ],
      "@typescript-eslint/consistent-type-assertions": [
        "warn",
        {
          arrayLiteralTypeAssertions: "allow",
          assertionStyle: "as",
          objectLiteralTypeAssertions: "allow-as-parameter",
        }
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: 'no-type-imports'
        }
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowHigherOrderFunctions: false,
          allowDirectConstAssertionInArrowFunctions: false
        }
      ],
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "no-public",
          overrides: {
            parameterProperties: "explicit"
          }
        }
      ],
      "@typescript-eslint/explicit-module-boundary-types": [
        "error",
        {
          allowHigherOrderFunctions: false,
          allowDirectConstAssertionInArrowFunctions: false
        }
      ],
      "max-params": "off",
      "@typescript-eslint/max-params": [
        "warn",
        {
          max: 9,
          countVoidThis: true
        }
      ],
      "@typescript-eslint/member-ordering": [
        "warn",
        {
          default: [
            "signature",
            "public-static-field",
            "static-field",
            "public-decorated-field",
            "protected-decorated-field",
            "private-decorated-field",
            "decorated-field",
            "public-abstract-field",
            "protected-abstract-field",
            "abstract-field",
            "instance-field",
            "field",
            "static-initialization",
            "public-constructor",
            "protected-constructor",
            "private-constructor",
            "constructor",
            "public-static-method",
            "static-method",
            "public-decorated-method",
            "protected-decorated-method",
            "private-decorated-method",
            "decorated-method",
            "public-abstract-method",
            "protected-abstract-method",
            "abstract-method",
            "instance-method",
            "method",
          ]
        },
      ],
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "default",
          format: ["strictCamelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid"
        },
        {
          selector: "variable",
          format: ["strictCamelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid"
        },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["UPPER_CASE", "strictCamelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid"
        },
        {
          selector: "variable",
          modifiers: ["exported"],
          format: ["strictCamelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid"
        },
        {
          selector: "typeLike",
          format: ["StrictPascalCase"]
        },
        {
          selector: "typeParameter",
          format: ["PascalCase"],
          prefix: ["T", "K", "V"]
        },
        {
          selector: "enumMember",
          format: ["StrictPascalCase"]
        }
      ],
      "@typescript-eslint/no-explicit-any": [
        "warn",
        {
          fixToUnknown: true
        }
      ],
      "@typescript-eslint/no-extraneous-class": [
        "warn",
        {
          allowWithDecorator: true
        }
      ],
      "@typescript-eslint/no-inferrable-types": [
        "warn",
        {
          ignoreParameters: true,
          ignoreProperties: true
        }
      ],
      "no-magic-numbers": "off",
      "@typescript-eslint/no-magic-numbers": [
        "warn",
        {
          enforceConst: true,
          ignore: [-1, 0, 1, 2, 100],
          ignoreReadonlyClassProperties: true
        }
      ],
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": [
        "warn",
        {
          builtinGlobals: true,
          ignoreTypeValueShadow: false,
          ignoreFunctionTypeParameterNameValueShadow: false
        }
      ],
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": [
        "warn",
        {
          ignoreTypeReferences: false
        }
      ],
      "@typescript-eslint/unified-signatures": [
        "warn",
        {
          ignoreDifferentlyNamedParameters: true
        }
      ],
      // Angular best practices
      "@angular-eslint/component-class-suffix": ["error"],
      "@angular-eslint/consistent-component-styles": ["warn"],
      "@angular-eslint/contextual-decorator": ["error"],
      // default
      //"@angular-eslint/contextual-lifecycle": ["error"],
      "@angular-eslint/directive-class-suffix": ["error"],
      "@angular-eslint/no-async-lifecycle-method": ["error"],
      "@angular-eslint/no-attribute-decorator": ["error"],
      // require type
      // no-developer-preview
      // no-experimental
      "@angular-eslint/no-conflicting-lifecycle": ["error"],
      "@angular-eslint/no-duplicates-in-metadata-arrays": ["error"],
      // default
      //"@angular-eslint/no-empty-lifecycle-method": ["error"],
      "@angular-eslint/no-forward-ref": ["error"],
      // // Deprecated
      //'@angular-eslint/no-host-metadata-property': 'off',
      // default
      //@angular-eslint/no-input-rename
      //@angular-eslint/no-inputs-metadata-property,
      "@angular-eslint/no-lifecycle-call": ["error"],
      // default
      //@angular-eslint/no-output-native
      //@angular-eslint/no-output-on-prefix
      //@angular-eslint/no-output-rename
      //@angular-eslint/no-outputs-metadata-property,
      "@angular-eslint/no-pipe-impure": ["warn"],
      "@angular-eslint/no-queries-metadata-property": ["error"],
      // require type
      //"@angular-eslint/no-uncalled-signals": ["error"],
      // NON
      //"@angular-eslint/pipe-prefix"
      // default
      //"@angular-eslint/prefer-inject": ["warn"],
      "@angular-eslint/prefer-on-push-component-change-detection": ["warn"],
      "@angular-eslint/prefer-output-emitter-ref": ["warn"],
      "@angular-eslint/prefer-output-readonly": ["error"],
      "@angular-eslint/prefer-signals": ["warn"],
      // default
      //"@angular-eslint/prefer-standalone": ["error"],
      "@angular-eslint/relative-url-prefix": ["error"],
      "@angular-eslint/require-lifecycle-on-prototype": ["error"],
      "@angular-eslint/runtime-localize": ["warn"],
      "@angular-eslint/sort-lifecycle-methods": ["warn"],
      // // Deprecated
      //@angular-eslint/sort-ngmodule-metadata-arrays
      "@angular-eslint/use-component-selector": ["error"],
      "@angular-eslint/use-component-view-encapsulation": ["warn"],
      "@angular-eslint/use-injectable-provided-in": ["error"],
      "@angular-eslint/use-lifecycle-interface": ["error"],
      // default
      //"@angular-eslint/use-pipe-transform-interface": ["error"],
      // TypeScript best practices
      // use Record by default
      //'@typescript-eslint/consistent-indexed-object-style': 'off',
      // type is a simple type and interface is for object definition (default)
      //'@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
      "default-param-last": "off",
      "@typescript-eslint/default-param-last": ["error"],
      "init-declarations": "off",
      "@typescript-eslint/init-declarations": ["warn"],
      "@typescript-eslint/method-signature-style": ["warn"],
      // not recommended : automatically checked by the TypeScript compiler
      //"no-dupe-class-members": "off",
      //"@typescript-eslint/no-dupe-class-members": "error"
      "@typescript-eslint/no-dynamic-delete": ["error"],
      // default with error
      //"no-empty-function": "off",
      //'@typescript-eslint/no-empty-function': 'warn',
      // // Deprecated
      //'@typescript-eslint/no-empty-interface': 'error',
      "@typescript-eslint/no-import-type-side-effects": ["error"],
      // not recommended : automatically checked by the TypeScript compiler
      //'no-invalid-this': 'off',
      //'@typescript-eslint/no-invalid-this': ['warn'],
      "@typescript-eslint/no-invalid-void-type": ["error"],
      "no-loop-func": "off",
      "@typescript-eslint/no-loop-func": ["error"],
      "@typescript-eslint/no-non-null-asserted-nullish-coalescing": ["error"],
      "@typescript-eslint/no-non-null-assertion": ["error"],
      // not recommended : automatically checked by the TypeScript compiler
      //"no-redeclare": "off",
      //"@typescript-eslint/no-redeclare": "error"
      // AUCUN
      //@typescript-eslint/no-restricted-imports
      //@typescript-eslint/no-restricted-types
      "@typescript-eslint/no-unnecessary-parameter-property-assignment": ["error"],
      // default with error
      //"no-unused-vars": "off",
      //'@typescript-eslint/no-unused-vars': 'warn',
      "no-useless-constructor": "off",
      "@typescript-eslint/no-useless-constructor": ["error"],
      "@typescript-eslint/no-useless-empty-export": ["error"],
      "@typescript-eslint/parameter-properties": ["error"],
      // NON
      //@typescript-eslint/prefer-enum-initializers
      "@typescript-eslint/prefer-literal-enum-member": ["error"],
      // MegaO custom rules
      "mgw-eslint-rules/prefer-const-enum": ["warn"],
      "mgw-eslint-rules/no-inferrable-types-readonly-properties": ["warn"],
      "mgw-eslint-rules/avoid-backtick-without-interpolation": ["error"],
      // Plugin Import rules
      // namespace error sur app component !!!!
      "import/namespace": ["off"],
      // Plugin Node rules
      "n/no-new-require": ["error"],
      "n/exports-style": ["error"],
      // JavaScript best practices
      "array-callback-return": [
        "error",
        {
          checkForEach: true
        }
      ],
      "eqeqeq": ["error"],
      "capitalized-comments": [
        "warn",
        "always",
        {
          ignoreInlineComments: true,
          ignoreConsecutiveComments: true
        }
      ],
      "complexity": [
        "warn",
        {
          max: 40
        }
      ],
      "curly": ["error"],
      "default-case": ["error"],
      "default-case-last": ["error"],
      "func-name-matching": [
        "error",
        "never",
        {
          considerPropertyDescriptor: true
        }
      ],
      "func-names": [
        "error",
        "always"
      ],
      "func-style": [
        "warn",
        "declaration"
      ],
      "guard-for-in": ["error"],
      "logical-assignment-operators": [
        "warn",
        "always",
        {
          enforceForIfStatements: true
        }
      ],
      "max-classes-per-file": [
        "warn",
        1
      ],
      "max-depth": [
        "warn",
        5
      ],
      "max-lines": [
        "warn",
        {
          max: 510,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      "max-lines-per-function": [
        "warn",
        {
          max: 70,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      "max-nested-callbacks": [
        "warn",
        10
      ],
      "max-statements": [
        "warn",
        40,
        {
          ignoreTopLevelFunctions: true
        }
      ],
      "no-alert": ["error"],
      "no-await-in-loop": ["error"],
      "no-bitwise": ["error"],
      "no-caller": ["error"],
      "no-console": [
        "error",
        {
          allow: ["warn", "error"]
        }
      ],
      "no-continue": ["warn"],
      "no-constructor-return": ["error"],
      "no-div-regex": ["warn"],
      "no-else-return": [
        "error",
        {
          allowElseIf: false
        }
      ],
      "no-extend-native": ["error"],
      "no-extra-bind": ["error"],
      "no-implicit-coercion": [
        "error",
        {
          disallowTemplateShorthand: true
        }
      ],
      "no-implicit-globals": ["error"],
      "no-inline-comments": ["warn"],
      "no-iterator": ["error"],
      "no-labels": ["error"],
      "no-lone-blocks": ["error"],
      "no-lonely-if": ["error"],
      "no-multi-assign": ["error"],
      "no-multi-str": ["error"],
      "no-negated-condition": ["error"],
      "no-nested-ternary": ["error"],
      "no-new": ["error"],
      "no-new-func": ["error"],
      "no-new-wrappers": ["error"],
      "no-object-constructor": ["error"],
      "no-octal-escape": ["error"],
      "no-param-reassign": [
        "error",
        {
          props: true
        }
      ],
      "no-proto": ["error"],
      "no-plusplus": [
        "warn",
        {
          allowForLoopAfterthoughts: true
        }
      ],
      "no-promise-executor-return": ["error"],
      "no-restricted-globals": [
        "error",
        {
          name: "event",
          message: "Use local parameter instead."
        }
      ],
      "no-restricted-syntax": [
        "warn",
        {
          selector: "BinaryExpression[operator='**']",
          message: "Don't use the exponentiation operator (**). Use Math.pow() instead."
        }
      ],
      "no-return-assign": [
        "error",
        "always"
      ],
      "no-script-url": ["error"],
      "no-sequences": [
        "error",
        {
          allowInParentheses: false
        }
      ],
      "no-self-compare": ["error"],
      "no-template-curly-in-string": ["error"],
      "no-throw-literal": ["error"],
      "no-unassigned-vars": ["error"],
      "no-undef-init": ["error"],
      "no-underscore-dangle": [
        "error",
        {
          enforceInMethodNames: true,
          enforceInClassFields: true,
          allowInArrayDestructuring: false,
          allowInObjectDestructuring: false,
          allowFunctionParams: false
        }
      ],
      "no-unmodified-loop-condition": ["error"],
      "no-unneeded-ternary": [
        "warn",
        {
          defaultAssignment: false
        }
      ],
      "no-unreachable-loop": ["error"],
      "no-useless-assignment": ["error"],
      "no-useless-call": ["error"],
      "no-useless-computed-key": ["error"],
      "no-useless-concat": ["error"],
      "no-useless-rename": ["error"],
      "no-useless-return": ["error"],
      "no-var": ["error"],
      "no-void": ["error"],
      "no-warning-comments": [
        "warn",
        {
          terms: ["fixme", "xxx"]
        }
      ],
      // off rule above (replaced by typescript eslint rule)
      //'no-shadow': 'error',
      "object-shorthand": ["error"],
      "one-var": [
        "error",
        "never"
      ],
      "operator-assignment": [
        "warn",
        "always"
      ],
      "prefer-arrow-callback": [
        "error",
        {
          allowUnboundThis: false
        }
      ],
      "prefer-const": ["error"],
      "prefer-numeric-literals": ["error"],
      "prefer-object-has-own": ["warn"],
      "prefer-object-spread": ["error"],
      "prefer-regex-literals": [
        "error",
        {
          disallowRedundantWrapping: true
        }
      ],
      "prefer-rest-params": ["error"],
      "prefer-spread": ["error"],
      "prefer-template": ["error"],
      "preserve-caught-error": [
        "error",
        {
          requireCatchParameter: true
        }
      ],
      "radix": ["warn"],
      "require-atomic-updates": ["error"],
      "sort-imports": [
        "warn",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          allowSeparatedGroups: true,
        },
      ],
      "symbol-description": ["error"],
      "unicode-bom": ["error"],
      "yoda": [
        "error",
        "never",
        {
          exceptRange: true
        }
      ],
      // Security
      "no-eval": ["error"],
      // typescript-eslint require type
      //"no-implied-eval": ["error"],
      //"@typescript-eslint/no-implied-eval": "error"
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/alt-text": ["warn"],
      "@angular-eslint/template/attributes-order": ["warn"],
      // default
      //"@angular-eslint/template/banana-in-box": ["error"],
      "@angular-eslint/template/button-has-type": ["error"],
      "@angular-eslint/template/click-events-have-key-events": ["warn"],
      "@angular-eslint/template/conditional-complexity": ["warn"],
      "@angular-eslint/template/cyclomatic-complexity": [
        "warn",
        {
          maxComplexity: 40
        }
      ],
      "@angular-eslint/template/elements-content": ["error"],
      // default
      //'@angular-eslint/template/eqeqeq': 'error',
      // non
      //@angular-eslint/template/i18n
      "@angular-eslint/template/interactive-supports-focus": ["warn"],
      "@angular-eslint/template/label-has-associated-control": ["warn"],
      "@angular-eslint/template/mouse-events-have-key-events": ["warn"],
      "@angular-eslint/template/no-any": ["error"],
      "@angular-eslint/template/no-autofocus": ["error"],
      "@angular-eslint/template/no-call-expression": ["error"],
      "@angular-eslint/template/no-distracting-elements": ["error"],
      "@angular-eslint/template/no-duplicate-attributes": ["error"],
      "@angular-eslint/template/no-empty-control-flow": ["error"],
      "@angular-eslint/template/no-inline-styles": [
        "error",
        {
          allowNgStyle: true
        }
      ],
      "@angular-eslint/template/no-interpolation-in-attributes": [
        "error",
        {
          allowSubstringInterpolation: true
        }
      ],
      // default
      //"@angular-eslint/template/no-negated-async": ["error"],
      "@angular-eslint/template/no-nested-tags": ["warn"],
      "@angular-eslint/template/no-positive-tabindex": ["error"],
      "@angular-eslint/template/prefer-at-empty": ["warn"],
      "@angular-eslint/template/prefer-contextual-for-variables": [
        "warn",
        {
          "allowedAliases": {
            "$count": ["nb"],
            "$index": ["i", "index"],
            "$first": ["isFirst"],
            "$last": ["isLast"],
            "$even": ["isEven"],
            "$odd": ["isOdd"]
          }
        }
      ],
      "@angular-eslint/template/prefer-control-flow": ["warn"],
      "@angular-eslint/template/prefer-ngsrc": ["warn"],
      "@angular-eslint/template/prefer-self-closing-tags": ["error"],
      "@angular-eslint/template/prefer-static-string-properties": ["error"],
      "@angular-eslint/template/prefer-template-literal": ["error"],
      "@angular-eslint/template/role-has-required-aria": ["warn"],
      "@angular-eslint/template/table-scope": ["error"],
      "@angular-eslint/template/use-track-by-function": ["warn"],
      "@angular-eslint/template/valid-aria": ["error"],
    },
  },
  {
    files: ["**/*.html"],
    ignores: ["**/*inline-template-*.component.html"],
    extends: [
      eslintPluginPrettierRecommended
    ],
    rules: {
      "prettier/prettier": [
        "error",
        {
          "parser": "angular"
        }
      ],
    },
  }
);
