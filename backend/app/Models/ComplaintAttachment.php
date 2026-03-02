<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintAttachment extends Model
{
    protected $fillable = [
        'complaint_id',
        'file_path',
        'file_name',
        'uploaded_by',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'complaint_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
