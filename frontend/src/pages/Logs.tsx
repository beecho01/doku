import { useState, useMemo, useEffect } from "react";
import { useQuery } from "react-query";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Spinner,
  Tabs,
  Tab,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { Search, FileText, Eye } from "lucide-react";
import { apiService } from "@/services/api";
import type { ContainerLogs, LogInfo } from "@/types";

export default function Logs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "running" | "stopped"
  >("all");
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: "ascending" | "descending";
  }>({ column: "", direction: "ascending" });

  // Container logs functionality
  const [selectedContainer, setSelectedContainer] = useState<string | null>(
    null
  );
  const [containerLogs, setContainerLogs] = useState<ContainerLogs | null>(
    null
  );
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalSize, setModalSize] = useState<"full" | "4xl">("4xl");

  const { data, isLoading, error } = useQuery<LogInfo[]>(
    "logs",
    apiService.getLogs,
    {
      refetchInterval: 30000,
    }
  );

  const viewContainerLogs = async (
    containerId: string,
    containerName: string
  ) => {
    setSelectedContainer(containerName);
    setIsLoadingLogs(true);
    try {
      const logs = await apiService.getContainerLogs(containerId, 100);
      setContainerLogs(logs);
      onOpen();
    } catch (error) {
      console.error("Failed to fetch container logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredContainers = useMemo(() => {
    if (!data) return [];

    let filtered = data.filter((log) => {
      const matchesSearch =
        log.container_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.image.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Apply status filter - for logs, we'll show all since we don't have status
    if (activeFilter === "running") {
      filtered = filtered; // Show all logs for now
    } else if (activeFilter === "stopped") {
      filtered = filtered; // Show all logs for now
    }

    // Apply sorting
    if (sortDescriptor.column) {
      filtered = filtered.sort((a: LogInfo, b: LogInfo) => {
        let aValue: any;
        let bValue: any;

        switch (sortDescriptor.column) {
          case "name":
            aValue = a.container_name.toLowerCase();
            bValue = b.container_name.toLowerCase();
            break;
          case "image":
            aValue = a.image.toLowerCase();
            bValue = b.image.toLowerCase();
            break;
          case "size":
            aValue = a.size;
            bValue = b.size;
            break;
          case "created":
            aValue = new Date(a.created).getTime();
            bValue = new Date(b.created).getTime();
            break;
          default:
            return 0;
        }

        if (sortDescriptor.direction === "ascending") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [data, searchQuery, activeFilter, sortDescriptor]);

  const summary = useMemo(() => {
    if (!data) return { total: 0, running: 0, stopped: 0, totalSize: 0 };

    return data.reduce(
      (acc, log) => {
        acc.total++;
        acc.totalSize += log.size;
        // For logs, we don't have running/stopped status, so we'll count all as "running"
        acc.running++;
        return acc;
      },
      { total: 0, running: 0, stopped: 0, totalSize: 0 }
    );
  }, [data]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Below md breakpoint
        setModalSize("full");
      } else {
        setModalSize("4xl");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <CardBody className="px-6 py-6">
          <p className="text-red-600 dark:text-red-400">
            Failed to load container logs. Please try again.
          </p>
        </CardBody>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Container Logs
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Monitor Docker container log files and their sizes
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs
          aria-label="Filter Options"
          selectedKey={activeFilter}
          onSelectionChange={(key) =>
            setActiveFilter(key as "all" | "running" | "stopped")
          }
          variant="solid"
          color="primary"
          radius="full"
          className="md:flex-shrink-0"
        >
          <Tab key="all" title={`All Logs (${data.length})`}></Tab>
          <Tab key="running" title={`All Logs (${summary.running})`}></Tab>
          <Tab key="stopped" title={`All Logs (${summary.stopped})`}></Tab>
        </Tabs>
        <div className="flex md:justify-end md:flex-1">
          <Input
            placeholder="Search containers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            className="w-full md:max-w-sm"
            variant="flat"
            isClearable
            onClear={() => setSearchQuery("")}
          />
        </div>
      </div>

      {/* Containers Table */}
      <Card className="p-0 bg-transparent border-0 border-blue-400/15 elevation-0 shadow-none">
        <CardBody className="px-0 py-0 bg-blue-400/5 rounded-lg">
          <Table
            aria-label="Docker Containers table"
            removeWrapper
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor: any) => setSortDescriptor(descriptor)}
          >
            <TableHeader>
              <TableColumn key="name" allowsSorting>
                Container Name
              </TableColumn>
              <TableColumn key="image" allowsSorting>
                Image
              </TableColumn>
              <TableColumn key="size" allowsSorting>
                Log Size
              </TableColumn>
              <TableColumn key="created" allowsSorting>
                Last Scan
              </TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredContainers.map((log) => (
                <TableRow key={log.container_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.container_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {log.image}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatBytes(log.size)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(log.created)}</div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={<Eye className="w-3 h-3" />}
                      onClick={() =>
                        viewContainerLogs(log.container_id, log.container_name)
                      }
                      isLoading={
                        isLoadingLogs &&
                        selectedContainer === log.container_name
                      }
                    >
                      View Logs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Container Logs Modal */}
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onClose={onClose}
        size={modalSize}
        scrollBehavior="outside"
        placement="auto"
      >
        <ModalContent className="p-2 xs:m-0 sm:m-0 md:m-16">
          <ModalHeader className="flex-col">
            <div className="flex items-center gap-2 pb-5">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>Container Logs - {selectedContainer}</span>
            </div>
            {containerLogs ? (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Lines requested: {containerLogs.lines_requested}</span>
                <span>
                  Timestamp:{" "}
                  {new Date(containerLogs.timestamp).toLocaleString()}
                </span>
              </div>
            ) : null}
          </ModalHeader>
          <ModalBody className="overflow-visible">
            {containerLogs ? (
              <pre
                className="
                  flex-1
                  overflow-auto
                  bg-gray-100 dark:bg-gray-800 p-4 rounded-lg
                  font-mono text-sm whitespace-pre-wrap
                "
                aria-label="Container logs"
              >
                {containerLogs.logs}
              </pre>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <Spinner size="lg" />
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
