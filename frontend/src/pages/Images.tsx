import { useQuery } from "react-query";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { Search, Container } from "lucide-react";
import { apiService } from "@/services/api";
import type { ImageInfo, DockerSystemInfo } from "@/types";
import { useState, useMemo } from "react";

export default function Images() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "in-use" | "unused">(
    "all"
  );
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: "ascending" | "descending";
  }>({ column: "", direction: "ascending" });

  const { isOpen, onClose } = useDisclosure();

  const { data, isLoading, error } = useQuery<ImageInfo[]>(
    "images",
    apiService.getImages,
    { refetchInterval: 30000 }
  );

  // System info query
  const { data: systemInfo } = useQuery<DockerSystemInfo>(
    'systemInfo',
    apiService.getSystemInfo,
    { refetchInterval: 60000 }
  );

  const filteredImages = useMemo(() => {
    if (!data) return [];

    let filtered = data.filter((image) =>
      image.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeFilter === "in-use") {
      filtered = filtered.filter((image) => image.containers > 0);
    } else if (activeFilter === "unused") {
      filtered = filtered.filter((image) => image.containers === 0);
    }

    if (sortDescriptor.column) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortDescriptor.column as keyof ImageInfo];
        let bValue: any = b[sortDescriptor.column as keyof ImageInfo];

        if (sortDescriptor.column === "size") {
          aValue = a.size;
          bValue = b.size;
        }

        if (aValue < bValue) return sortDescriptor.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortDescriptor.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, activeFilter, sortDescriptor]);

  const formatSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getContainerStatusColor = (containerCount: number) => {
    if (containerCount === 0) return "default";
    if (containerCount === 1) return "success";
    return "primary";
  };

  const activeImages = useMemo(() => {
    if (!data) return 0;
    return data.filter((image) => image.containers > 0).length;
  }, [data]);

  const unusedImages = useMemo(() => {
    if (!data) return 0;
    return data.filter((image) => image.containers === 0).length;
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
            Failed to load images data. Please try again.
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
            Images
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor your Docker images
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs
          aria-label="Filter Options"
          selectedKey={activeFilter}
          onSelectionChange={(key) => setActiveFilter(key as "all" | "in-use" | "unused")}
          variant="solid"
          color="primary"
          radius="full"
          className="md:flex-shrink-0"
        >
          <Tab key="all" title={`All (${data.length})`}></Tab>
          <Tab key="in-use" title={`In Use (${activeImages})`}></Tab>
          <Tab key="unused" title={`Unused (${unusedImages})`}></Tab>
        </Tabs>
        <div className="flex md:justify-end md:flex-1 gap-2">
          <Input
            placeholder="Search images..."
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

      {/* Images Table */}
      <Card className="p-0 bg-transparent border-0 border-blue-400/15 elevation-0 shadow-none">
        <CardBody className="px-0 py-0 bg-blue-400/5 rounded-lg">
          <Table
            aria-label="Docker Images table"
            removeWrapper
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor: any) => setSortDescriptor(descriptor)}
          >
            <TableHeader>
              <TableColumn key="repository" allowsSorting>Repository</TableColumn>
              <TableColumn key="tag" allowsSorting>Tag</TableColumn>
              <TableColumn key="id" allowsSorting>Image ID</TableColumn>
              <TableColumn key="created" allowsSorting>Created</TableColumn>
              <TableColumn key="size" allowsSorting>Size</TableColumn>
              <TableColumn key="containers" allowsSorting>Containers</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredImages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-500">No images to display</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredImages.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      <div className="font-medium">{image.repository}</div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary">
                        {image.tag}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                          {image.id.replace("sha256:", "").substring(0, 12)}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        {formatDate(image.created)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatSize(image.size)}
                        </div>
                        {image.virtual_size !== image.size && (
                          <div className="text-xs text-gray-500">
                            Virtual: {formatSize(image.virtual_size)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getContainerStatusColor(image.containers)}
                        startContent={<Container className="w-3 h-3 m-1" />}
                      >
                        {image.containers === 0
                          ? "Unused"
                          : `${image.containers} container${
                              image.containers > 1 ? "s" : ""
                            }`}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* System Info Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Docker System Information</h3>
          </ModalHeader>
          <ModalBody className="pb-6">
            {systemInfo ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      System Resources
                    </h4>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Containers:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.Containers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Running:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.ContainersRunning || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Paused:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.ContainersPaused || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Stopped:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.ContainersStopped || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Images:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.Images || 0}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Host Information
                    </h4>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Architecture:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.Architecture || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">OS:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.OperatingSystem || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Kernel:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.KernelVersion || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">CPUs:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.NCPU || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Memory:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.MemTotal
                            ? `${Math.round(systemInfo.MemTotal / 1024 / 1024 / 1024)} GB`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Docker Version:</span>
                        <span className="text-sm font-medium">
                          {systemInfo.ServerVersion || "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
                <span className="ml-2">Loading system information...</span>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
