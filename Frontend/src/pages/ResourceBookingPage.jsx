import { useState } from 'react';
import { HiCalendar, HiExclamationCircle, HiCheckCircle, HiPlus } from 'react-icons/hi';
import { INITIAL_RESOURCES, INITIAL_BOOKINGS } from '../data/dummyData';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { useToast } from '../context/ToastContext';

// Generate time slots 08:00 – 20:00
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => {
  const h = i + 8;
  return `${String(h).padStart(2, '0')}:00`;
});

function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function hasConflict(bookings, start, end) {
  const s = timeToMin(start);
  const e = timeToMin(end);
  return bookings.some((b) => {
    const bs = timeToMin(b.startTime);
    const be = timeToMin(b.endTime);
    return s < be && e > bs;
  });
}

function BookingModal({ isOpen, onClose, onBook, resourceId }) {
  const [form, setForm] = useState({ date: '', startTime: '09:00', endTime: '10:00', team: '' });
  const [conflict, setConflict] = useState(false);

  const dayBookings = INITIAL_BOOKINGS.filter(
    (b) => b.resourceId === resourceId && b.date === form.date
  );

  const checkConflict = (start, end) => {
    setConflict(hasConflict(dayBookings, start, end));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book a Slot" size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onBook(form)} disabled={conflict || !form.date || !form.team}>
            Confirm Booking
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Time"
            type="time"
            value={form.startTime}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, startTime: v }));
              checkConflict(v, form.endTime);
            }}
          />
          <Input
            label="End Time"
            type="time"
            value={form.endTime}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, endTime: v }));
              checkConflict(form.startTime, v);
            }}
          />
        </div>
        <Input
          label="Team / Purpose"
          placeholder="e.g. Engineering Sprint Review"
          value={form.team}
          onChange={(e) => setForm({ ...form, team: e.target.value })}
          required
        />
        {conflict && (
          <div className="alert-danger text-xs">
            <HiExclamationCircle size={15} />
            Requested slot conflicts with an existing booking — slot is unavailable.
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function ResourceBookingPage() {
  const { toast } = useToast();

  const [selectedResourceId, setResourceId] = useState('');
  const [viewDate,           setViewDate]   = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [showModal, setModal]   = useState(false);

  const resource = INITIAL_RESOURCES.find((r) => String(r.id) === selectedResourceId);



  const dayBookings = bookings.filter(
    (b) => b.resourceId === Number(selectedResourceId) && b.date === viewDate
  );

  const handleBook = (form) => {
    const conflict = hasConflict(dayBookings, form.startTime, form.endTime);
    if (conflict) { toast.error('Slot conflict detected.'); return; }

    const newBooking = {
      id:           Date.now(),
      resourceId:   Number(selectedResourceId),
      resourceName: resource?.name,
      bookedBy:     form.team,
      date:         form.date || viewDate,
      startTime:    form.startTime,
      endTime:      form.endTime,
      status:       'Confirmed',
    };
    setBookings((b) => [...b, newBooking]);
    toast.success(`Booking confirmed for ${form.startTime}–${form.endTime}`);
    setModal(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="page-header">
        <div>
          <h2 className="page-title">Resource Booking</h2>
          <p className="page-subtitle">Book rooms and shared equipment</p>
        </div>
      </div>

      {/* Resource + Date Selectors */}
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Resource"
            value={selectedResourceId}
            onChange={(e) => setResourceId(e.target.value)}
            options={INITIAL_RESOURCES.map((r) => ({ value: String(r.id), label: r.name }))}
            placeholder="Select a resource…"
            required
          />
          <Input
            label="Date"
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
          />
        </div>

        {resource && (
          <div className="flex items-center gap-3 text-xs text-content-muted border-t border-surface-border pt-3">
            <HiCalendar size={14} />
            <span>{resource.name} · Capacity: {resource.capacity} · {resource.location}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      {selectedResourceId && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-content-primary mb-4">
            Schedule – {new Date(viewDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          <div className="space-y-0">
            {TIME_SLOTS.map((slot) => {
              const slotMin  = timeToMin(slot);
              const booking  = dayBookings.find((b) => {
                const bs = timeToMin(b.startTime);
                const be = timeToMin(b.endTime);
                return slotMin >= bs && slotMin < be;
              });
              const isStart = booking && timeToMin(booking.startTime) === slotMin;

              return (
                <div key={slot} className="booking-time-row">
                  <span className="booking-time-label">{slot}</span>
                  <div className="flex-1">
                    {isStart && (
                      <div className="booking-slot-booked">
                        <HiCheckCircle size={12} className="inline mr-1" />
                        Booked – {booking.bookedBy} ({booking.startTime} to {booking.endTime})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <Button icon={HiPlus} onClick={() => setModal(true)} disabled={!selectedResourceId}>
              Book a Slot
            </Button>
          </div>
        </div>
      )}

      {!selectedResourceId && (
        <div className="card p-10 text-center text-content-muted text-sm">
          Select a resource above to view its availability calendar.
        </div>
      )}

      <BookingModal
        isOpen={showModal}
        onClose={() => setModal(false)}
        onBook={handleBook}
        resourceId={Number(selectedResourceId)}
      />
    </div>
  );
}
