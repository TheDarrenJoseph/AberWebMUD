import unittest
import logging
import sys

VERBOSITY = 0
LOGGER = logging.getLogger()
LOGGER.setLevel(logging.DEBUG)

# Adding some niceness to the default TextTestRunner, test totals, etc
class CustomRunner(unittest.TextTestRunner):
    def run(self, test):
        ran_count = 0
        errors = []
        failures = []

        for suite in test:
            for test_suite in suite:
                unique_tests = test_suite._tests
                if unique_tests is not None and len(unique_tests) > 0:
                    for test_class in unique_tests:
                        logging.info('Running: ' + str(test_class) + '\n')
                else:
                    logging.info(('Skipping empty test group..\n'))
                    continue

                output = unittest.TextTestRunner.run(self, test_suite)
                ran_count += output.testsRun
                errors.extend(output.errors)
                failures.extend(output.failures)

        total_errors = len(errors)
        total_failures = len(failures)
        if (total_errors == 0 and total_errors == 0):
            logging.info(('=== SUCCESS total ran: %d, errors: %d, failures: %d ===\n' % (ran_count, total_errors, total_failures)))
        else:
            logging.info(('=== FAILED total ran: %d, errors: %d, failures: %d ===\n' % (ran_count, total_errors, total_failures)))

    def __init__(self, *args, **kwargs):
        super(CustomRunner, self).__init__(*args, **kwargs)


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.discover('.')
    # runner = unittest.TextTestRunner(verbosity=VERBOSITY)
    runner = CustomRunner(verbosity=VERBOSITY)
    runner.run(suite)
