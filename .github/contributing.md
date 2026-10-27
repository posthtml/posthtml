You want to help? You rock! Now, take a moment to be sure your contributions make sense to everyone else.

## Reporting Issues

Found a problem? Want a new feature?

- See if your issue or idea has [already been reported].
- Provide a [reduced test case] or a [live example].

Remember, a bug is a _demonstrable problem_ caused by _our_ code.

## Submitting Pull Requests

Pull requests are the greatest contributions, so be sure they are focused in scope, and do avoid unrelated commits.

1. To begin, [fork this project], clone your fork, and add our upstream.
	```bash
	# Clone your fork of the repo into the current directory
	git clone https://github.com/<your-username>/posthtml
	# Navigate to the newly cloned directory
	cd posthtml
	# Assign the original repo to a remote called "upstream"
	git remote add upstream https://github.com/posthtml/posthtml
	# Install the tools necessary for development
	npm ci
	```

2. Create a branch for your feature or fix:
	```bash
	# Move into a new branch for a feature
	git checkout -b feature/thing
	```
	```bash
	# Move into a new branch for a fix
	git checkout -b fix/something
	```

3. Be sure your code follows our practices.
	```bash
	# Test current code
	npm run test
	# Check code style
	npm run lint
	```

   Tests must return their Promise, use `async`/`await`, or call Mocha's `done` callback so that asynchronous assertions are awaited. `npm test` also checks coverage: 100% for statements, functions, and lines, and at least 95% for branches.

4. Push your branch up to your fork:
	```bash
	# Push a feature branch
	git push origin feature/thing
	```
	```bash
	# Push a fix branch
	git push origin fix/something
	```

5. Now [open a pull request] with a clear title and description.

[already been reported]: issues
[fork this project]:     fork
[live example]:          http://codepen.io/pen
[open a pull request]:   https://help.github.com/articles/using-pull-requests/
[reduced test case]:     https://css-tricks.com/reduced-test-cases/
