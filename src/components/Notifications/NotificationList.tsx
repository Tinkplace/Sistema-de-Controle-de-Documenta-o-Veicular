import React from 'react';
import { Bell, Send, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Notification } from '../../types';
import Button from '../Common/Button';
import { formatDate } from '../../utils/documentHelpers';

interface NotificationListProps {
  notifications: Notification[];
  onSendNotification: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onSendNotification
}) => {
  const getStatusIcon = (status: Notification['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'sent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusText = (status: Notification['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'sent':
        return 'Enviada';
      case 'failed':
        return 'Falhou';
    }
  };

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'sent':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Bell className="h-4 w-4" />
          <span>{notifications.filter(n => n.status === 'pending').length} pendentes</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-gray-500">
              As notificações aparecerão aqui quando houver documentos próximos ao vencimento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      {getStatusIcon(notification.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {notification.documentType} - {notification.entityName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(notification.status)}`}>
                          {getStatusText(notification.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                          Vence em: {formatDate(notification.expiryDate)}
                        </div>
                        <div>
                          Criada em: {formatDate(notification.createdAt)}
                        </div>
                        {notification.sentAt && (
                          <div>
                            Enviada em: {formatDate(notification.sentAt)}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Destinatários:</span>
                        <div className="mt-1">
                          {notification.recipients.map((recipient, index) => (
                            <span
                              key={recipient}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2 mb-1"
                            >
                              {recipient}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {notification.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSendNotification(notification.id)}
                        icon={Send}
                      >
                        Enviar Agora
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;