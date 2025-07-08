from datetime import datetime
from .dbconfig import db

class Friend(db.Model):
    __tablename__ = 'friends'
    
    id = db.Column(db.Integer, primary_key=True)
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    requestee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    requester_encrypted_ss = db.Column(db.Text, nullable=True)
    requester_iv = db.Column(db.Text, nullable=True)
    requestee_encrypted_ss = db.Column(db.Text, nullable=True)
    requestee_iv = db.Column(db.Text, nullable=True)
    encapsulation = db.Column(db.Text, nullable=True)
    accepted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)