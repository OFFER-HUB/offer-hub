"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDisputeWorkflow } from "@/hooks/use-dispute-workflow";
import {
  NotificationCenterProps,
  WorkflowNotification,
  NotificationType,
  DeliveryMethod,
} from "@/types/workflow.types";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Search,
  Check,
  Trash2,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  stage_transition: <CheckCircle className="h-4 w-4" />,
  deadline_alert: <AlertCircle className="h-4 w-4" />,
  action_required: <Clock className="h-4 w-4" />,
  resolution_update: <CheckCircle className="h-4 w-4" />,
  system_alert: <AlertCircle className="h-4 w-4" />,
  evidence_request: <MessageSquare className="h-4 w-4" />,
  mediator_assignment: <MessageSquare className="h-4 w-4" />,
  arbitration_escalation: <AlertCircle className="h-4 w-4" />,
};

const deliveryMethodIcons: Record<DeliveryMethod, React.ReactNode> = {
  in_app: <Bell className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  sms: <Smartphone className="h-4 w-4" />,
  push: <Smartphone className="h-4 w-4" />,
};

const notificationTypeLabels: Record<NotificationType, string> = {
  stage_transition: "Stage Transition",
  deadline_alert: "Deadline Alert",
  action_required: "Action Required",
  resolution_update: "Resolution Update",
  system_alert: "System Alert",
  evidence_request: "Evidence Request",
  mediator_assignment: "Mediator Assignment",
  arbitration_escalation: "Arbitration Escalation",
};

const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  in_app: "In-App",
  email: "Email",
  sms: "SMS",
  push: "Push",
};

export function NotificationCenter({
  disputeId,
  showAllNotifications = false,
  allowMarkAsRead = true,
  allowSendNotification = false,
  compact = false,
}: NotificationCenterProps) {
  const { actions } = useDisputeWorkflow(disputeId || "default");
  const [notifications, setNotifications] = useState<WorkflowNotification[]>(
    []
  );
  const [filteredNotifications, setFilteredNotifications] = useState<
    WorkflowNotification[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<NotificationType | "all">("all");
  const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">(
    "all"
  );
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const [isComposing, setIsComposing] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: "action_required" as NotificationType,
    title: "",
    message: "",
    deliveryMethod: "in_app" as DeliveryMethod,
  });

  // Mock notifications data - in real implementation, this would come from the API
  useEffect(() => {
    const mockNotifications: WorkflowNotification[] = [
      {
        id: "1",
        disputeId: disputeId || "default",
        userId: "user123",
        notificationType: "stage_transition",
        title: "Dispute moved to Mediation Process",
        message:
          "Your dispute has been moved to the mediation process stage. A mediator will be assigned shortly.",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        deliveryMethod: "in_app",
      },
      {
        id: "2",
        disputeId: disputeId || "default",
        userId: "user123",
        notificationType: "deadline_alert",
        title: "Evidence submission deadline approaching",
        message:
          "You have 24 hours remaining to submit evidence for your dispute.",
        sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        deliveryMethod: "email",
      },
      {
        id: "3",
        disputeId: disputeId || "default",
        userId: "user123",
        notificationType: "action_required",
        title: "Response required from mediator",
        message:
          "The mediator has requested additional information. Please respond within 48 hours.",
        sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        deliveryMethod: "push",
      },
      {
        id: "4",
        disputeId: disputeId || "default",
        userId: "user123",
        notificationType: "mediator_assignment",
        title: "Mediator assigned to your dispute",
        message:
          "John Smith has been assigned as your mediator. They will contact you within 24 hours.",
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        readAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        deliveryMethod: "in_app",
      },
    ];

    setNotifications(mockNotifications);
  }, [disputeId]);

  // Filter notifications based on search and filters
  useEffect(() => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((n) => n.notificationType === filterType);
    }

    if (filterRead === "read") {
      filtered = filtered.filter((n) => n.readAt);
    } else if (filterRead === "unread") {
      filtered = filtered.filter((n) => !n.readAt);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, filterType, filterRead]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // In real implementation, this would call the API
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, readAt: new Date() } : n
        )
      );
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date() }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const notification: Omit<WorkflowNotification, "id" | "sentAt"> = {
        disputeId: disputeId || "default",
        userId: "current_user", // In real implementation, get from context
        notificationType: newNotification.type,
        title: newNotification.title,
        message: newNotification.message,
        deliveryMethod: newNotification.deliveryMethod,
      };

      await actions.sendNotification(notification);

      // Add to local state
      const newNotif: WorkflowNotification = {
        ...notification,
        id: Date.now().toString(),
        sentAt: new Date(),
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setNewNotification({
        type: "action_required",
        title: "",
        message: "",
        deliveryMethod: "in_app",
      });
      setIsComposing(false);
      toast.success("Notification sent successfully");
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  };

  const getUnreadCount = (): number => {
    return notifications.filter((n) => !n.readAt).length;
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case "deadline_alert":
      case "system_alert":
      case "arbitration_escalation":
        return "border-red-200 bg-red-50";
      case "action_required":
        return "border-yellow-200 bg-yellow-50";
      case "stage_transition":
      case "resolution_update":
        return "border-green-200 bg-green-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Notifications</span>
              {getUnreadCount() > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {getUnreadCount()}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredNotifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-2 rounded-lg border ${
                  notification.readAt ? "bg-gray-50" : "bg-white shadow-sm"
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {notificationIcons[notification.notificationType]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(notification.sentAt)}
                    </p>
                  </div>
                  {!notification.readAt && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredNotifications.length > 3 && (
            <div className="mt-2 text-center">
              <Button variant="ghost" size="sm" className="text-xs">
                View all {filteredNotifications.length} notifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-gray-500" />
          <div>
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-sm text-gray-600">
              {getUnreadCount()} unread of {notifications.length} total
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {allowMarkAsRead && getUnreadCount() > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}

          {allowSendNotification && (
            <Dialog open={isComposing} onOpenChange={setIsComposing}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Notification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value: NotificationType) =>
                        setNewNotification((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(notificationTypeLabels).map(
                          ([type, label]) => (
                            <SelectItem key={type} value={type}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Enter notification title"
                      value={newNotification.title}
                      onChange={(e) =>
                        setNewNotification((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter notification message"
                      value={newNotification.message}
                      onChange={(e) =>
                        setNewNotification((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Delivery Method
                    </label>
                    <Select
                      value={newNotification.deliveryMethod}
                      onValueChange={(value: DeliveryMethod) =>
                        setNewNotification((prev) => ({
                          ...prev,
                          deliveryMethod: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(deliveryMethodLabels).map(
                          ([method, label]) => (
                            <SelectItem key={method} value={method}>
                              <div className="flex items-center space-x-2">
                                {deliveryMethodIcons[method as DeliveryMethod]}
                                <span>{label}</span>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsComposing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSendNotification}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filterType}
              onValueChange={(value: NotificationType | "all") =>
                setFilterType(value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(notificationTypeLabels).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterRead}
              onValueChange={(value: "all" | "read" | "unread") =>
                setFilterRead(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            <Checkbox
              checked={
                selectedNotifications.length === filteredNotifications.length &&
                filteredNotifications.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`transition-all duration-200 ${
                  notification.readAt ? "opacity-75" : "shadow-sm"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={() =>
                        handleSelectNotification(notification.id)
                      }
                    />

                    <div
                      className={`flex-shrink-0 p-2 rounded-full ${getNotificationColor(
                        notification.notificationType
                      )}`}
                    >
                      {notificationIcons[notification.notificationType]}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="outline" className="text-xs">
                            <div className="flex items-center space-x-1">
                              {deliveryMethodIcons[notification.deliveryMethod]}
                              <span>
                                {
                                  deliveryMethodLabels[
                                    notification.deliveryMethod
                                  ]
                                }
                              </span>
                            </div>
                          </Badge>

                          {!notification.readAt && (
                            <Badge variant="destructive" className="text-xs">
                              Unread
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Sent {formatDate(notification.sentAt)}</span>
                        {notification.readAt && (
                          <span>Read {formatDate(notification.readAt)}</span>
                        )}
                      </div>
                    </div>

                    {allowMarkAsRead && !notification.readAt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== "all" || filterRead !== "all"
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedNotifications.length} notification
                {selectedNotifications.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                {allowMarkAsRead && (
                  <Button size="sm" variant="outline">
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
