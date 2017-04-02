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
