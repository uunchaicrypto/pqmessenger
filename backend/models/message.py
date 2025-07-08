from datetime import datetime
from .dbconfig import db

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey('friends.id'), nullable=False)
    msg = db.Column(db.Text, nullable=False)
    iv = db.Column(db.Text, nullable=False)
    msg_timestamp = db.Column(db.DateTime, default=datetime.utcnow)