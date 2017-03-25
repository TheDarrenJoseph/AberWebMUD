import unittest

import diceTest


if __name__ == "__main__":
    test_suite = unittest.TestSuite()
    test_suite.addTest(diceTest.diceRollGood())
    unittest.main()
