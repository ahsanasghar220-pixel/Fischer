<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintActivityLog extends Model
{
    protected $table = 'complaint_activity_log';

    protected $fillable = [
        'complaint_id',
        'user_id',
        'action_type',
        'old_status',
        'new_status',
        'body',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'complaint_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
