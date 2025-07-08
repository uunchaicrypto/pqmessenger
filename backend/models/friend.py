from datetime import datetime
from firebase_admin import firestore

class Friend:
    def __init__(self, requester_id=None, requestee_id=None, requester_encrypted_ss=None,
                 requester_iv=None, requestee_encrypted_ss=None, requestee_iv=None,
                 encapsulation=None, accepted=False, created_at=None, id=None):
        self.id = id
        self.requester_id = requester_id
        self.requestee_id = requestee_id
        self.requester_encrypted_ss = requester_encrypted_ss
        self.requester_iv = requester_iv
        self.requestee_encrypted_ss = requestee_encrypted_ss
        self.requestee_iv = requestee_iv
        self.encapsulation = encapsulation
        self.accepted = accepted
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert friend object to dictionary for Firestore"""
        return {
            'requester_id': self.requester_id,
            'requestee_id': self.requestee_id,
            'requester_encrypted_ss': self.requester_encrypted_ss,
            'requester_iv': self.requester_iv,
            'requestee_encrypted_ss': self.requestee_encrypted_ss,
            'requestee_iv': self.requestee_iv,
            'encapsulation': self.encapsulation,
            'accepted': self.accepted,
            'created_at': self.created_at
        }
    
    @classmethod
    def from_dict(cls, data, doc_id=None):
        """Create friend object from Firestore document"""
        friend = cls()
        friend.id = doc_id
        friend.requester_id = data.get('requester_id')
        friend.requestee_id = data.get('requestee_id')
        friend.requester_encrypted_ss = data.get('requester_encrypted_ss')
        friend.requester_iv = data.get('requester_iv')
        friend.requestee_encrypted_ss = data.get('requestee_encrypted_ss')
        friend.requestee_iv = data.get('requestee_iv')
        friend.encapsulation = data.get('encapsulation')
        friend.accepted = data.get('accepted', False)
        friend.created_at = data.get('created_at')
        return friend
    
    @staticmethod
    def get_by_id(db, friend_id):
        """Get friend relationship by ID"""
        doc = db.collection('friends').document(friend_id).get()
        if doc.exists:
            return Friend.from_dict(doc.to_dict(), doc.id)
        return None
    
    @staticmethod
    def get_friendships_by_user(db, user_id):
        """Get all friendships for a user (both as requester and requestee)"""
        friends_ref = db.collection('friends')
        # Get friendships where user is requester
        requester_query = friends_ref.where('requester_id', '==', user_id)
        # Get friendships where user is requestee
        requestee_query = friends_ref.where('requestee_id', '==', user_id)
        
        friendships = []
        for doc in requester_query.stream():
            friendships.append(Friend.from_dict(doc.to_dict(), doc.id))
        for doc in requestee_query.stream():
            friendships.append(Friend.from_dict(doc.to_dict(), doc.id))
        
        return friendships
    
    @staticmethod
    def get_pending_requests(db, user_id):
        """Get pending friend requests for a user"""
        friends_ref = db.collection('friends')
        query = friends_ref.where('requestee_id', '==', user_id).where('accepted', '==', False)
        
        requests = []
        for doc in query.stream():
            requests.append(Friend.from_dict(doc.to_dict(), doc.id))
        
        return requests
    
    def save(self, db):
        """Save friend relationship to Firestore"""
        friends_ref = db.collection('friends')
        if self.id:
            # Update existing friendship
            friends_ref.document(self.id).set(self.to_dict())
        else:
            # Create new friendship
            doc_ref = friends_ref.add(self.to_dict())
            self.id = doc_ref[1].id
        return self.id