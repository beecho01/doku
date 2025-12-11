import { useState, useMemo } from "react";
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
  Chip,
  Input,
  Spinner,
  Tabs,
  Tab,
} from "@heroui/react";
import { Search } from "lucide-react";
import { apiService } from "@/services/api";
import type { ContainerInfo } from "@/types";

export default function Containers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "running" | "stopped"
  >("all");
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: "ascending" | "descending";
  }>({ column: "", direction: "ascending" });

  const {
    data,
    isLoading,
    error,
  } = useQuery<ContainerInfo[]>("containers", apiService.getContainers, {
    refetchInterval: 30000,
  });

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
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  };

  const filteredContainers = useMemo(() => {
    if (!data) return [];

    let filtered = data.filter((container) => {
      const matchesSearch =
        container.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        container.image.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Apply status filter
    if (activeFilter === "running") {
      filtered = filtered.filter((container) => container.status === "running");
    } else if (activeFilter === "stopped") {
      filtered = filtered.filter((container) => container.status !== "running");
    }

    // Apply sorting
    if (sortDescriptor.column) {
      filtered = filtered.sort((a: ContainerInfo, b: ContainerInfo) => {
        let aValue: any;
        let bValue: any;

        switch (sortDescriptor.column) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "image":
            aValue = a.image.toLowerCase();
            bValue = b.image.toLowerCase();
            break;
          case "status":
            aValue = a.status.toLowerCase();
            bValue = b.status.toLowerCase();
            break;
          case "created":
            aValue = new Date(a.created).getTime();
            bValue = new Date(b.created).getTime();
            break;
          case "size":
            aValue = a.size;
            bValue = b.size;
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
      (acc, container) => {
        acc.total++;
        acc.totalSize += container.size;
        if (container.status === "running") acc.running++;
        else acc.stopped++;
        return acc;
      },
      { total: 0, running: 0, stopped: 0, totalSize: 0 }
    );
  }, [data]);

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
            Failed to load containers. Please try again.
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
            Containers
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor your Docker containers
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs
          aria-label="Filter Options"
          selectedKey={activeFilter}
          onSelectionChange={(key) => setActiveFilter(key as "all" | "running" | "stopped")}
          variant="solid"
          color="primary"
          radius="full"
          className="md:flex-shrink-0"
        >
          <Tab key="all" title={`All (${data.length})`}></Tab>
          <Tab key="running" title={`Running (${summary.running})`}></Tab>
          <Tab key="stopped" title={`Stopped (${summary.stopped})`}></Tab>
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
            onClear={() => setSearchQuery('')}
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
              <TableColumn key="name" allowsSorting>Name</TableColumn>
              <TableColumn key="image" allowsSorting>Image</TableColumn>
              <TableColumn key="status" allowsSorting>Status</TableColumn>
              <TableColumn key="created" allowsSorting>Created</TableColumn>
              <TableColumn key="size" allowsSorting>Size</TableColumn>
              <TableColumn>Ports</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredContainers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-500">No containers to display</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContainers.map((container) => (
                  <TableRow key={container.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{container.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {container.image}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          container.status === "running" ? "success" : "default"
                        }
                      >
                        {container.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(container.created)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatBytes(container.size)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {container.ports
                          .filter(port => !port.startsWith(':::')) // Filter out IPv6 mappings
                          .map((port, index) => {
                            // Parse port mapping to extract host port
                            const portMatch = port.match(/^(\d+)->/);
                            const hostPort = portMatch ? portMatch[1] : null;
                            const url = hostPort ? `http://localhost:${hostPort}` : null;

                            return url ? (
                              <Chip
                                key={index}
                                size="sm"
                                variant="flat"
                                color="primary"
                                as="a"
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer hover:bg-primary-600"
                              >
                                {port}
                              </Chip>
                            ) : (
                              <Chip
                                key={index}
                                size="sm"
                                variant="flat"
                                color="primary"
                              >
                                {port}
                              </Chip>
                            );
                          })}
                        {container.ports.filter(port => !port.startsWith(':::')).length === 0 && (
                          <span className="text-xs text-gray-500">No ports</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
