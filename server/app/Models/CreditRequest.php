<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditRequest extends Model
{
    protected $fillable = [
        'user_id', 
        'requestable_id', 
        'requestable_type', 
        'status'
    ];

    public function requestable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}