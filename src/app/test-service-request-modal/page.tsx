"use client";
import { useState } from "react";
import ServiceRequestModal from "@/components/modals/service-request-modal";

const TestServiceRequestModalPage = () => {
  const [open, setOpen] = useState(false);

  const serviceId = "123e4567-e89b-12d3-a456-426614174000";

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Service Request Modal</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setOpen(true)}
      >
        Open Modal
      </button>
      <ServiceRequestModal
        open={open}
        onClose={() => setOpen(false)}
        serviceId={serviceId}
      />
    </div>
  );
};

export default TestServiceRequestModalPage;
