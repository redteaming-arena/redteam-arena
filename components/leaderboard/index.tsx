"use client"

import * as React from "react"
import {
  CaretSortIcon,
} from "@radix-ui/react-icons"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export type LeaderboardEntry = {
  position: number
  username: string
  score: number
}

const leaderboardData = [
  {
      "position": 1,
      "username": "0xNone",
      "score": 0
  },
  {
      "position": 2,
      "username": "CryptoKing",
      "score": 95
  },
  {
      "position": 3,
      "username": "BlockMiner",
      "score": 89
  },
  {
      "position": 4,
      "username": "HashMaster",
      "score": 85
  },
  {
      "position": 5,
      "username": "BitWizard",
      "score": 82
  },
  {
      "position": 6,
      "username": "ChainBreaker",
      "score": 78
  },
  {
      "position": 7,
      "username": "SatoshiFan",
      "score": 75
  },
  {
      "position": 8,
      "username": "Nakamoto",
      "score": 72
  },
  {
      "position": 9,
      "username": "TokenGamer",
      "score": 70
  },
  {
      "position": 10,
      "username": "LedgerLord",
      "score": 68
  },
  {
      "position": 11,
      "username": "CoinCollector",
      "score": 65
  },
  {
      "position": 12,
      "username": "EtherHawk",
      "score": 62
  },
  {
      "position": 13,
      "username": "BlockchainBoss",
      "score": 60
  },
  {
      "position": 14,
      "username": "NodeNinja",
      "score": 58
  },
  {
      "position": 15,
      "username": "SmartContractor",
      "score": 56
  },
  {
      "position": 16,
      "username": "CryptoKnight",
      "score": 54
  },
  {
      "position": 17,
      "username": "TokenTamer",
      "score": 52
  },
  {
      "position": 18,
      "username": "BlockBuster",
      "score": 50
  },
  {
      "position": 19,
      "username": "GasGuzzler",
      "score": 48
  },
  {
      "position": 20,
      "username": "ChainRider",
      "score": 45
  }
];



export const columns: ColumnDef<LeaderboardEntry>[] = [
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => <div>{row.getValue("position")}</div>,
  },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("username")}</div>,
  },
  {
    accessorKey: "score",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Score
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("score")}</div>,
  },
 
]

function LeaderboardSkeleton() {
  return (
    <div className="w-full space-y-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 w-full">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-5 w-full"  />
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  )
}

export function LeaderboardTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [data, setData] = React.useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/game/leaderboard')
      .then(response => response.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching leaderboard data:', error)
        setLoading(false)
      })
  }, [])

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
  })

  if (loading) {
    return <LeaderboardSkeleton />
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter usernames..."
          value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
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
          {table.getRowCount()} user(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}