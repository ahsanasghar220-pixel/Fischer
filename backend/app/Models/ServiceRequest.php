<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'city',
        'address',
        'product_id',
        'product_name',
        'model_number',
        'serial_number',
        'purchase_date',
        'under_warranty',
        'service_type',
        'problem_description',
        'images',
        'status',
        'priority',
        'assigned_to',
        'assigned_at',
        'scheduled_date',
        'scheduled_time_slot',
        'diagnosis',
        'resolution',
        'estimated_cost',
        'final_cost',
        'completed_at',
        'customer_rating',
        'customer_feedback',
        'admin_notes',
    ];

    protected $casts = [
        'images' => 'array',
        'under_warranty' => 'boolean',
        'purchase_date' => 'date',
        'assigned_at' => 'datetime',
        'scheduled_date' => 'datetime',
        'completed_at' => 'datetime',
        'estimated_cost' => 'decimal:2',
        'final_cost' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function history(): HasMany
    {
        return $this->hasMany(ServiceRequestHistory::class)->orderByDesc('created_at');
    }

    // Scopes
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    // Methods
    public static function generateTicketNumber(): string
    {
        $prefix = 'SRV';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -4));

        return "{$prefix}-{$date}-{$random}";
    }

    public function assign(int $userId, ?string $notes = null): void
    {
        $this->update([
            'assigned_to' => $userId,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        $this->addHistory('assigned', $notes);
    }

    public function updateStatus(string $status, ?string $notes = null, ?int $changedBy = null): void
    {
        $this->update(['status' => $status]);

        if ($status === 'completed' && !$this->completed_at) {
            $this->update(['completed_at' => now()]);
        }

        $this->addHistory($status, $notes, $changedBy);
    }

    public function addHistory(string $status, ?string $notes = null, ?int $changedBy = null): void
    {
        $this->history()->create([
            'status' => $status,
            'notes' => $notes,
            'changed_by' => $changedBy,
        ]);
    }

    public function getServiceTypeLabelAttribute(): string
    {
        return match ($this->service_type) {
            'installation' => 'Installation',
            'repair' => 'Repair',
            'maintenance' => 'Maintenance',
            'warranty_claim' => 'Warranty Claim',
            'replacement' => 'Replacement',
            'other' => 'Other',
            default => ucfirst($this->service_type),
        };
    }

    public function getPriorityLabelAttribute(): string
    {
        return match ($this->priority) {
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            'urgent' => 'Urgent',
            default => ucfirst($this->priority),
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pending',
            'assigned' => 'Assigned',
            'in_progress' => 'In Progress',
            'on_hold' => 'On Hold',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            default => ucfirst($this->status),
        };
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            if (empty($request->ticket_number)) {
                $request->ticket_number = self::generateTicketNumber();
            }
        });

        static::created(function ($request) {
            $request->addHistory($request->status, 'Service request created');
        });
    }
}
