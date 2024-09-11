import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Dot } from "lucide-react";

import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const createColumns = (label, score) => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="out"
        className="hover:bg-transparent text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <Button
        variant="out"
        className="hover:bg-transparent text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {score}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("score"));
      return <div className="text-center font-medium">{score.toFixed(2)}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = parseFloat(rowA.getValue(columnId));
      const b = parseFloat(rowB.getValue(columnId));
      return a > b ? 1 : a < b ? -1 : 0;
    },
  },
  {
    accessorKey: "improved",
    header: "",
    cell: ({ row }) => (
      <div>
        {row.getValue("improved") > 0 ? (
          <ArrowUp color="green" />
        ) : row.getValue("improved") == 0 ? (
          <Dot />
        ) : (
          <ArrowDown color="red" />
        )}
      </div>
    ),
  },
];

const DataTable = ({ data, label, score = "Score" }) => {
  const [sorting, setSorting] = useState([{ id: "score", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = createColumns(label, score);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 12, // Set this to your desired number of rows
      },
    },
  });

  return (
    <div className="md:w-full w-screen pb-12">
      <div className="flex items-center py-4">
        <Input
          placeholder={`Filter ${label.toLowerCase()}s...`}
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={event =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-black"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export const MultiTableComponent = ({ playerData, promptData, modelData }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:space-x-8 space-x-0 space-y-2 md:space-y-0 xl:h-screen h-fit mt-2">
        <DataTable data={playerData || []} label="Username" />
        <DataTable data={modelData} label="Model" score="Resistance"/>
        <DataTable data={promptData || []} label="Target Prompt" />
      
    </div>
  );
};

const UserRankingTable = ({
  username = null,
  position = null,
  data,
  title,
}) => {
  console.log(username);
  return (
    <div className="w-full mb-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Username</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user, index) => (
            <TableRow
              key={index}
              data-state={user.username === username && "selected"}
            >
              <TableCell>{user.position}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell className="text-right">
                {user.score.toFixed(5)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const localCreateColumns = username => [
  {
    accessorKey: "position",
    header: ({ column }) => (
      <Button
        variant="out"
        className="hover:bg-transparent text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Position
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("position")}</div>,
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <Button
        variant="out"
        className="hover:bg-transparent text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Username
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("username")}</div>,
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <Button
        variant="out"
        className="hover:bg-transparent text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Score
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("score"));
      return <div className="text-right font-medium">{score.toFixed(5)}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = parseFloat(rowA.getValue(columnId));
      const b = parseFloat(rowB.getValue(columnId));
      return a > b ? 1 : a < b ? -1 : 0;
    },
  },
];


const ModelCreateColumns = (label, score) => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="out"
        className="hover:bg-transparent text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <Button
        variant="out"
        className="hover:bg-transparent text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Resistance
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("score"));
      return <div className="text-center font-medium">{score.toFixed(2)}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = parseFloat(rowA.getValue(columnId));
      const b = parseFloat(rowB.getValue(columnId));
      return a > b ? 1 : a < b ? -1 : 0;
    },
  },
  {
    accessorKey: "improved",
    header: "",
    cell: ({ row }) => (
      <div>
        {row.getValue("improved") > 0 ? (
          <ArrowUp color="green" />
        ) : row.getValue("improved") == 0 ? (
          <Dot />
        ) : (
          <ArrowDown color="red" />
        )}
      </div>
    ),
  },
];


export const UserRankingComponent = ({ userData }) => {
  const {
    username,
    user_position,
    user_score,
    total_users,
    top_users,
    around_users,
  } = userData;
  const [sorting, setSorting] = useState([{ id: "position", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = localCreateColumns(username);
  const data = user_position <= 10 ? top_users : around_users;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="md:w-auto w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.original.username === username ? "selected" : undefined
                  }
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
