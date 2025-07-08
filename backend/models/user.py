from datetime import datetime
from firebase_admin import firestore

class User:
    def __init__(self, username=None, password_hash=None, public_key=None, 
                 encrypted_secret_key=None, iv=None, salt=None, created_at=None, id=None):
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.public_key = public_key
        self.encrypted_secret_key = encrypted_secret_key
        self.iv = iv
        self.salt = salt
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert user object to dictionary for Firestore"""
        return {
            'username': self.username,
            'password_hash': self.password_hash,
            'public_key': self.public_key,
            'encrypted_secret_key': self.encrypted_secret_key,
            'iv': self.iv,
            'salt': self.salt,
            'created_at': self.created_at
        }
    
    @classmethod
    def from_dict(cls, data, doc_id=None):
        """Create user object from Firestore document"""
        user = cls()
        user.id = doc_id
        user.username = data.get('username')
        user.password_hash = data.get('password_hash')
        user.public_key = data.get('public_key')
        user.encrypted_secret_key = data.get('encrypted_secret_key')
        user.iv = data.get('iv')
        user.salt = data.get('salt')
        user.created_at = data.get('created_at')
        return user
    
    @staticmethod
    def get_by_username(db, username):
        """Get user by username"""
        users_ref = db.collection('users')
        query = users_ref.where('username', '==', username).limit(1)
        docs = query.stream()
        for doc in docs:
            return User.from_dict(doc.to_dict(), doc.id)
        return None
    
    @staticmethod
    def get_by_id(db, user_id):
        """Get user by ID"""
        doc = db.collection('users').document(user_id).get()
        if doc.exists:
            return User.from_dict(doc.to_dict(), doc.id)
        return None
    
    def save(self, db):
        """Save user to Firestore"""
        users_ref = db.collection('users')
        if self.id:
            # Update existing user
            users_ref.document(self.id).set(self.to_dict())
        else:
            # Create new user
            doc_ref = users_ref.add(self.to_dict())
            self.id = doc_ref[1].id
        return self.id