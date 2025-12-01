<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class Request extends Model
{
    use HasFactory, Notifiable;

    protected $guarded = [ ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'validated_at' => 'datetime',
        'validated_at_level1' => 'datetime',
        'validated_at_level2' => 'datetime',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            if (empty($request->request_code)) {
                $request->request_code = static::generateRequestCode();
            }
        });
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by_id');
    }

    public function validatorLevel1()
    {
        return $this->belongsTo(User::class, 'validated_by_level1_id');
    }

    public function validatorLevel2()
    {
        return $this->belongsTo(User::class, 'validated_by_level2_id');
    }

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function sensor()
    {
        return $this->belongsTo(Sensor::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeApprovedToday($query)
    {
        return $query->where('status', 'approved')
                    ->whereDate('validated_at', today());
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['in_progress', 'approved']);
    }

    /**
     * Vérifie si la demande nécessite une double validation
     */
    public function requiresDualValidation(): bool
    {
        return in_array($this->priority, ['critical', 'emergency']);
    }

    /**
     * Vérifie si les deux validations sont approuvées
     */
    public function hasBothApprovals(): bool
    {
        if (!$this->requiresDualValidation()) {
            return $this->status === 'approved';
        }

        return $this->validation_status_level1 === 'approved' 
            && $this->validation_status_level2 === 'approved';
    }

    /**
     * Vérifie si une validation a été rejetée
     */
    public function hasRejection(): bool
    {
        if (!$this->requiresDualValidation()) {
            return $this->status === 'rejected';
        }

        return $this->validation_status_level1 === 'rejected' 
            || $this->validation_status_level2 === 'rejected';
    }

    private static function generateRequestCode(): string
    {
        $year = date('Y');
        $month = date('m');
        $prefix = "BR-{$year}-{$month}-";
        
        $lastRequest = static::where('request_code', 'like', $prefix . '%')
                           ->orderBy('request_code', 'desc')
                           ->first();

        if ($lastRequest) {
            $lastNumber = (int) substr($lastRequest->request_code, -3);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}
