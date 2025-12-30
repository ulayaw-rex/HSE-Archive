<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    protected $table = 'comments';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';
    

    protected $fillable = [
        'body',
        'user_id',
        'publication_id',
        'is_edited',
    ];

    protected $casts = [
    'is_edited' => 'boolean', 
];

    public function publication(): BelongsTo
    {
        return $this->belongsTo(Publication::class, 'publication_id', 'publication_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function histories()
{
    return $this->hasMany(CommentHistory::class)->orderBy('created_at', 'desc');
}
}