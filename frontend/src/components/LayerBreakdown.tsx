import { Tooltip, Card, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";

type LayerCategory = {
  name: string;
  size: number;
  color: "primary" | "secondary" | "success" | "warning" | "danger" | "default";
};

type LayerData = {
  total: number;
  used: number;
  categories: LayerCategory[];
};

interface LayerBreakdownProps {
  data: LayerData;
}

export default function LayerBreakdown({ data }: LayerBreakdownProps) {
  // Calculate percentages for each category
  const categoryPercentages = data.categories.map(category => ({
    ...category,
    percentage: Math.round((category.size / data.total) * 100)
  }));

  // Sort categories by size (largest first)
  const sortedCategories = [...categoryPercentages].sort((a, b) => b.size - a.size);

  // Calculate free space
  const freeSpace = data.total - data.used;
  const freePercentage = Math.round((freeSpace / data.total) * 100);

  return (
    <Card className="space-y-6 dark:bg-blue-400/5 px-5 py-5">
      <CardHeader className="px-0 py-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Layer Distribution</h2>
        </div>
      </CardHeader>
      {/* Custom multicolored progress bar */}
      <div className="h-6 w-full bg-default-100 rounded-md overflow-hidden flex">
        {sortedCategories.map((category, index) => (
          <Tooltip
            key={category.name}
            content={`${category.name}: ${category.size} layers (${category.percentage}%)`}
            placement="top"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${category.percentage}%` }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              className={`h-full bg-${category.color}`}
              style={{ minWidth: category.percentage > 0 ? '4px' : '0' }}
            />
          </Tooltip>
        ))}
        {freePercentage > 0 && (
          <Tooltip content={`Available: ${freeSpace} layers (${freePercentage}%)`} placement="top">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${freePercentage}%` }}
              transition={{ duration: 0.8, delay: sortedCategories.length * 0.1, ease: "easeOut" }}
              className="h-full bg-default-200"
              style={{ minWidth: freePercentage > 0 ? '4px' : '0' }}
            />
          </Tooltip>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedCategories.map(category => (
          <div key={category.name} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full bg-${category.color}`} />
            <div className="flex items-center gap-2">
              <span className="text-sm">{category.name}</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-sm font-medium">{category.size} layers</span>
              <span className="text-xs text-default-400">({category.percentage}%)</span>
            </div>
          </div>
        ))}

        {/* Free space */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-default-200" />
          <div className="flex items-center gap-2">
            <span className="text-sm">Available</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-sm font-medium">{freeSpace} layers</span>
            <span className="text-xs text-default-400">({freePercentage}%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
