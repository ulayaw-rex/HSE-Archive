<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'comments';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the model's ID is auto-incrementing.
     */
    public $incrementing = true;

    /**
     * The "type" of the auto-incrementing ID.
     */
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'body',
        'user_id',
        'publication_id',
    ];

    /**
     * Get the publication that this comment belongs to.
     */
    public function publication(): BelongsTo
    {
        // Links this model's 'publication_id' to the
        // 'publication_id' on the 'Publication' model.
        return $this->belongsTo(Publication::class, 'publication_id', 'publication_id');
    }

    /**
     * Get the user (author) that this comment belongs to.
     */
    public function user(): BelongsTo
    {
        // Links this model's 'user_id' to the
        // 'id' on the 'User' model (which is standard).
        return $this->belongsTo(User::class);
    }
}