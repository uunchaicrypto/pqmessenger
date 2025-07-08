from datetime import datetime
from firebase_admin import firestore

class Message:
    def __init__(self, sender_id=None, receiver_id=None, friend_id=None, 
                 msg=None, iv=None, msg_timestamp=None, id=None):
        self.id = id
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.friend_id = friend_id
        self.msg = msg
        self.iv = iv
        self.msg_timestamp = msg_timestamp or datetime.utcnow()
    
    def to_dict(self):
        """Convert message object to dictionary for Firestore"""
        return {
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'friend_id': self.friend_id,
            'msg': self.msg,
            'iv': self.iv,
            'msg_timestamp': self.msg_timestamp
        }
    
    @classmethod
    def from_dict(cls, data, doc_id=None):
        """Create message object from Firestore document"""
        message = cls()
        message.id = doc_id
        message.sender_id = data.get('sender_id')
        message.receiver_id = data.get('receiver_id')
        message.friend_id = data.get('friend_id')
        message.msg = data.get('msg')
        message.iv = data.get('iv')
        message.msg_timestamp = data.get('msg_timestamp')
        return message
    
    @staticmethod
    def get_by_id(db, message_id):
        """Get message by ID"""
        doc = db.collection('messages').document(message_id).get()
        if doc.exists:
            return Message.from_dict(doc.to_dict(), doc.id)
        return None
    
    @staticmethod
    def get_messages_by_friendship(db, friend_id, limit=50):
        """Get messages for a specific friendship"""
        messages_ref = db.collection('messages')
        query = messages_ref.where('friend_id', '==', friend_id).order_by('msg_timestamp', direction=firestore.Query.DESCENDING).limit(limit)
        
        messages = []
        for doc in query.stream():
            messages.append(Message.from_dict(doc.to_dict(), doc.id))
        
        return messages
    
    @staticmethod
    def get_messages_between_users(db, user1_id, user2_id, limit=50):
        """Get messages between two users"""
        messages_ref = db.collection('messages')
        # Get messages where user1 is sender and user2 is receiver
        query1 = messages_ref.where('sender_id', '==', user1_id).where('receiver_id', '==', user2_id)
        # Get messages where user2 is sender and user1 is receiver
        query2 = messages_ref.where('sender_id', '==', user2_id).where('receiver_id', '==', user1_id)
        
        messages = []
        for doc in query1.stream():
            messages.append(Message.from_dict(doc.to_dict(), doc.id))
        for doc in query2.stream():
            messages.append(Message.from_dict(doc.to_dict(), doc.id))
        
        # Sort by timestamp
        messages.sort(key=lambda x: x.msg_timestamp)
        return messages[-limit:] if len(messages) > limit else messages
    
    def save(self, db):
        """Save message to Firestore"""
        messages_ref = db.collection('messages')
        if self.id:
            # Update existing message
            messages_ref.document(self.id).set(self.to_dict())
        else:
            # Create new message
            doc_ref = messages_ref.add(self.to_dict())
            self.id = doc_ref[1].id
        return self.id