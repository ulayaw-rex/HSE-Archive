import React, { useState, useEffect, useCallback, useRef } from "react";
import AxiosInstance from "../../AxiosInstance";
import DatePicker from "../../components/common/DatePicker";
import {
  FaShieldAlt,
  FaHistory,
  FaUserLock,
  FaSync,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

type UserInfo = {
  id: number;
  name: string;
  email: string;
};

interface AuditLog {
  id: number;
  user: UserInfo | string;
  action: string;
  details: string;
  ip: string;
  date: string;
}

interface LoginHistory {
  id: number;
  user: UserInfo | string;
  ip: string;
  status: "Success" | "Failed";
  date: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

const Security: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"audit" | "logins">("audit");

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);

  const [auditPagination, setAuditPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loginPagination, setLoginPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 7) + "-01",
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (silent = false, page = 1) => {
      if (silent) setIsRefreshing(true);
      else setLoading(true);

      try {
        if (activeTab === "audit") {
          const res = await AxiosInstance.get(`/analytics/audit?page=${page}`, {
            params: { start_date: startDate, end_date: endDate },
          });
          if (isMounted.current) {
            setAuditLogs(res.data.data);
            setAuditPagination({
              current_page: res.data.current_page,
              last_page: res.data.last_page,
              total: res.data.total,
            });
          }
        } else {
          const res = await AxiosInstance.get(
            `/analytics/logins?page=${page}`,
            {
              params: { start_date: startDate, end_date: endDate },
            },
          );
          if (isMounted.current) {
            setLoginHistory(res.data.data);
            setLoginPagination({
              current_page: res.data.current_page,
              last_page: res.data.last_page,
              total: res.data.total,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching security data", error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [activeTab, startDate, endDate],
  );

  useEffect(() => {
    fetchData(false, 1);
  }, [fetchData]);

  useEffect(() => {
    const currentPage =
      activeTab === "audit"
        ? auditPagination.current_page
        : loginPagination.current_page;
    const intervalId = setInterval(() => fetchData(true, currentPage), 15000);
    return () => clearInterval(intervalId);
  }, [
    fetchData,
    activeTab,
    auditPagination.current_page,
    loginPagination.current_page,
  ]);

  const handlePageChange = (newPage: number) => {
    const currentMeta =
      activeTab === "audit" ? auditPagination : loginPagination;
    if (newPage >= 1 && newPage <= currentMeta.last_page) {
      fetchData(false, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getActionStyle = (action: string) => {
    if (action.includes("Lockdown Enabled")) {
      return "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 transition-colors";
    }
    if (action.includes("Lockdown Disabled")) {
      return "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 transition-colors";
    }
    return "text-blue-600 dark:text-blue-400 transition-colors";
  };

  const getActionIcon = (action: string) => {
    if (action.includes("Lockdown Enabled")) return <FaLock className="mr-1" />;
    if (action.includes("Lockdown Disabled"))
      return <FaUnlock className="mr-1" />;
    return null;
  };

  const renderUser = (user: UserInfo | string) => {
    if (typeof user === "object" && user !== null) {
      return (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-gray-100 transition-colors">
            {user.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
            {user.email}
          </span>
        </div>
      );
    }
    return (
      <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors">
        {user}
      </span>
    );
  };

  const pagination = activeTab === "audit" ? auditPagination : loginPagination;

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-200">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 transition-colors">
            <FaShieldAlt className="text-green-700" />
            Security & Access Control
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor system access, audit trails, and login attempts.
          </p>
        </div>

        {isRefreshing && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse self-start md:self-auto">
            <FaSync className="animate-spin" />
            Updating live...
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-lg dark:shadow-gray-900/50 mb-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between lg:items-end">
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto transition-colors">
            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-1 lg:flex-none justify-center ${
                activeTab === "audit"
                  ? "bg-white dark:bg-gray-600 text-green-800 dark:text-green-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <FaHistory /> Audit Log
            </button>
            <button
              onClick={() => setActiveTab("logins")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-1 lg:flex-none justify-center ${
                activeTab === "logins"
                  ? "bg-white dark:bg-gray-600 text-green-800 dark:text-green-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <FaUserLock /> Login History
            </button>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2 transition-colors tracking-wide">
                Start Date
              </label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2 transition-colors tracking-wide">
                End Date
              </label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="overflow-x-auto">
          {activeTab === "audit" && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700 transition-colors">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      <FaSync className="animate-spin inline-block mr-2" />
                      Loading audit logs...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No logs found within this date range.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-green-600/10 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 transition-colors">
                        {new Date(log.date).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300 transition-colors">
                        {renderUser(log.user)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md ${getActionStyle(
                            log.action,
                          )}`}
                        >
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                      </td>

                      <td
                        className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate transition-colors"
                        title={log.details}
                      >
                        {log.details || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 transition-colors">
                        {log.ip}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "logins" && (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 transition-colors">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      <FaSync className="animate-spin inline-block mr-2" />
                      Loading login history...
                    </td>
                  </tr>
                ) : loginHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No login records found.
                    </td>
                  </tr>
                ) : (
                  loginHistory.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-green-600/10 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 transition-colors">
                        {new Date(log.date).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300 transition-colors">
                        {renderUser(log.user)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 transition-colors">
                        {log.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            log.status === "Success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && pagination.last_page > 1 && (
          <div className="flex items-center justify-end border-t border-gray-100 p-4">
            <nav className="flex items-center gap-4">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="text-sm font-medium text-gray-500 hover:text-green-700 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
              >
                Previous
              </button>

              <div className="text-sm">
                <span className="font-bold text-green-700">
                  {pagination.current_page}
                </span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-600">{pagination.last_page}</span>
              </div>

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="text-sm font-medium text-gray-500 hover:text-green-700 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Security;
