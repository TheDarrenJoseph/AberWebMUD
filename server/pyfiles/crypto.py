#Handles all passlib crypto for the project
from passlib.context import CryptContext
from os import urandom

hasher = CryptContext(schemes=["argon2"],deprecated="auto")

#hashedPass should be the hasher .hash string output
def verify_password(password:str, hashedPass:str):
    return hasher.verify(password,hashedPass)

def hash_password(password):
    hashedPass = hasher.hash(password)
    print('argon2 salted hash is: '+hashedPass)
    return hashedPass

    #   This is used to break apart the hash result, might not be needed for now
        #hashVals = hashedPass.split('$') #Break apart our hashstring
        #salt = hashVals[4]
        #hashedPass = hashVals[5]
        #print(hashVals)
        #print('salt '+salt)
        #print('hash '+hashedPass)
        #print('SALT: '+salt.decode(encoding='UTF-8'))
