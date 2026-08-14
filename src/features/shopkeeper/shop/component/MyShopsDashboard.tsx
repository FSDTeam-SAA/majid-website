"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Store,
  Search,
  Plus,
  MoreVertical,
  Banknote,
  CreditCard,
  Users,
  Loader2,
  Building2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getShopPerformance } from "../api/shop.api";
import { useShop } from "../store/shop.store";
import { useCurrency } from "@/hooks/useCurrency";
import AddShop from "./AddShop";

export default function MyShopsDashboard() {
  const router = useRouter();
  const { setActiveShop } = useShop();
  const { formatCurrency, currencySymbol } = useCurrency();

  const [searchQuery, setSearchQuery] = useState("");
  const [shopFilter, setShopFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["shopPerformance", dateFilter],
    queryFn: () => getShopPerformance(dateFilter),
  });

  const filteredShops = useMemo(() => {
    if (!data?.shops) return [];
    return data.shops.filter((shop) => {
      const matchesSearch =
        shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.shopAddress &&
          shop.shopAddress.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        shopFilter === "all" ||
        (shopFilter === "active" && shop.isActive) ||
        (shopFilter === "inactive" && !shop.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, shopFilter]);

  const handleViewShop = (shopId: string) => {
    setActiveShop(shopId);
    router.push("/shopkeeper/dashboard");
  };

  const aggregate = data?.aggregate || {
    activeShopsCount: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalStaff: 0,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            My Shops
          </h1>
          <p className="text-sm font-medium text-slate-500">
            View and manage performance across all your store locations.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-full bg-[#84CC16] px-6 text-white hover:bg-[#76b813] shadow-sm shadow-[#84CC16]/20 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Shop
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search shops"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full bg-white border-slate-200"
          />
        </div>

        <Select value={shopFilter} onValueChange={setShopFilter}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-full bg-white border-slate-200">
            <SelectValue placeholder="All shops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All shops</SelectItem>
            <SelectItem value="active">Active shops</SelectItem>
            <SelectItem value="inactive">Inactive shops</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-full bg-white border-slate-200">
            <SelectValue placeholder="Today" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#84CC16]" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/10">
                <Building2 className="h-6 w-6 text-[#84CC16]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-black text-slate-900 truncate">
                  {aggregate.activeShopsCount}
                </p>
                <p className="text-sm font-semibold text-slate-500 truncate">
                  Active Shops
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/10">
                <span className="text-2xl font-black text-[#84CC16]">
                  {currencySymbol}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-xl sm:text-2xl font-black text-[#84CC16] truncate"
                  title={formatCurrency(aggregate.totalSales)}
                >
                  {formatCurrency(aggregate.totalSales)}
                </p>
                <p className="text-sm font-semibold text-slate-500 truncate">
                  {dateFilter === "today" ? "Today's Sales" : "Total Sales"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/10">
                <Users className="h-6 w-6 text-[#84CC16]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-black text-slate-900 truncate">
                  {aggregate.totalCustomers}
                </p>
                <p className="text-sm font-semibold text-slate-500 truncate">
                  Customers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/10">
                <UserCheck className="h-6 w-6 text-[#84CC16]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-black text-slate-900 truncate">
                  {aggregate.totalStaff}
                </p>
                <p className="text-sm font-semibold text-slate-500 truncate">
                  Staff Working
                </p>
              </div>
            </div>
          </div>

          {/* Shop Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredShops.map((shop) => (
              <div
                key={shop._id}
                className="flex flex-col rounded-3xl bg-white p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md min-w-0"
              >
                <div className="flex items-start justify-between mb-6 gap-2">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/10">
                      <Store className="h-6 w-6 text-[#84CC16]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-black text-slate-900 leading-none mb-1.5 truncate">
                        {shop.shopName}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 line-clamp-1">
                        {shop.shopAddress || "No address provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {shop.isActive ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-600 border border-emerald-200/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase text-amber-600 border border-amber-200/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Pending
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-2xl"
                      >
                        <DropdownMenuItem
                          onClick={() => setActiveShop(shop._id)}
                        >
                          Switch to this shop
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/shopkeeper/settings/my-shop/${shop._id}/edit`,
                            )
                          }
                        >
                          Edit Shop
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mb-6 space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-500 truncate">
                    {dateFilter === "today" ? "Today's Sales" : "Sales"}
                  </p>
                  <p
                    className="text-2xl sm:text-3xl font-black text-slate-900 truncate"
                    title={formatCurrency(shop.stats.totalSales, shop.currency)}
                  >
                    {formatCurrency(shop.stats.totalSales, shop.currency)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 border-t border-b border-slate-100 py-4 min-w-0">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                      <Users className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {shop.stats.customersCount}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 truncate">
                      Customers
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[#84CC16] min-w-0">
                      <Banknote className="h-4 w-4 shrink-0" />
                      <span
                        className="text-xs font-bold text-slate-900 truncate"
                        title={formatCurrency(
                          shop.stats.cashSales,
                          shop.currency,
                        )}
                      >
                        {formatCurrency(shop.stats.cashSales, shop.currency)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 truncate">
                      Cash Sales
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-blue-500 min-w-0">
                      <CreditCard className="h-4 w-4 shrink-0" />
                      <span
                        className="text-xs font-bold text-slate-900 truncate"
                        title={formatCurrency(
                          shop.stats.cardSales,
                          shop.currency,
                        )}
                      >
                        {formatCurrency(shop.stats.cardSales, shop.currency)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 truncate">
                      Card Sales
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">
                      Staff working today
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {shop.staff.slice(0, 3).map((member, i) => (
                          <Avatar
                            key={member._id}
                            className={`h-7 w-7 border-2 border-white ${i === 0 ? "bg-green-600" : i === 1 ? "bg-blue-600" : "bg-purple-600"}`}
                          >
                            <AvatarImage
                              src={member.image?.url}
                              alt={member.firstName}
                            />
                            <AvatarFallback className="text-[10px] text-white font-bold bg-inherit">
                              {member.firstName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-900 ml-1">
                        {shop.staff.length} staff
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="text-[#84CC16] hover:text-[#76b813] hover:bg-[#84CC16]/10 font-bold group rounded-full"
                    onClick={() => handleViewShop(shop._id)}
                  >
                    View shop
                    <span className="ml-1 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredShops.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <Store className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900">
                No shops found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your search or add a new shop.
              </p>
            </div>
          )}
        </>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none">
          <div className="bg-white rounded-3xl overflow-hidden max-h-[85vh] overflow-y-auto">
            <AddShop />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
