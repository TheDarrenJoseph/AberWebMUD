""" Handles all passlib crypto for the project """
from passlib.context import CryptContext
from os import urandom

HASHER = CryptContext(schemes=["argon2"], deprecated="auto")

#hashedPass should be the hasher .hash string output
def verify_password(password:str, hashed_pass:str):
    return HASHER.verify(password, hashed_pass)

def hash_password(password):
    hashed_pass = HASHER.hash(password)
    print('argon2 salted hash is: '+hashed_pass)
    return hashed_pass

    #   This is used to break apart the hash result, might not be needed for now
        #hashVals = hashedPass.split('$') #Break apart our hashstring
        #salt = hashVals[4]
        #hashedPass = hashVals[5]
        #print(hashVals)
        #print('salt '+salt)
        #print('hash '+hashedPass)
        #print('SALT: '+salt.decode(encoding='UTF-8'))
