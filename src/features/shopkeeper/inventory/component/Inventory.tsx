"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  MoreVertical,
  Search,
  Eye,
  Trash2,
  Edit2,
  Package,
  ArrowLeft,
  FolderOpen,
  ImageIcon,
  Loader2,
  Printer,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  useMyInventory,
  useDeleteInventory,
  useAddToShopkeeperCart,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks/useInventory";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";
import { useShop } from "../../shop/store/shop.store";

import { InventorySkeleton } from "./skeletons/InventorySkeleton";
import { InventoryFormModal } from "./modals/InventoryFormModal";
import { InventoryDetailsModal } from "./modals/InventoryDetailsModal";
import { PrintLabelModal } from "./modals/PrintLabelModal";
import { ImportCsvTab } from "./ImportCsvTab";
import { ImageGalleryModal } from "./modals/ImageGalleryModal";
import type { Category, InventoryItem } from "../types";
import { exportInventoryToCsv } from "../utils/csvUtils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ActiveTab = "inventory" | "import-csv";

const SELL_QUANTITY = 1;

const getCategoryImageSrc = (src: string) => {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(src)}`;
  }

  return src;
};

const getCategoryImageUrl = (category: Category) => {
  if (!category.image) return "";

  if (typeof category.image === "string") {
    return category.image;
  }

  return category.image.url ?? "";
};

const getInventoryImageUrl = (item: InventoryItem) => {
  return (
    item.image?.url ||
    item.images?.[0] ||
    item.sourceImageUrl ||
    item.sourceImageUrls?.[0] ||
    ""
  );
};

const getInventoryDisplayPrice = (item: InventoryItem) =>
  item.expectedPrice ?? item.salePrice ?? 0;

export default function Inventory() {
  const { formatCurrency } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories();
  const { activeShopId } = useShop();

  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    isError: isInventoryError,
  } = useMyInventory(
    { categoryId: selectedCategory?._id, shopId: activeShopId || undefined },
    { enabled: !!selectedCategory },
  );
  const { mutate: deleteItem } = useDeleteInventory();
  const { mutate: createCategory, isPending: isCreatingCategory } =
    useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdatingCategory } =
    useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { data: session } = useSession();
  const router = useRouter();
  const shopkeeperId = (session?.user as { id?: string })?.id;
  const { mutate: addToShopkeeperCart } = useAddToShopkeeperCart(shopkeeperId);

  const [activeTab, setActiveTab] = useState<ActiveTab>("inventory");
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState("");

  const categories = categoriesData?.data || [];

  const handleSell = (item: InventoryItem) => {
    if (!shopkeeperId) {
      toast.error("Session not found");
      return;
    }

    addToShopkeeperCart(
      { item, quantity: SELL_QUANTITY },
      {
        onSuccess: () => toast.success("Added to the walk-in order"),
        onError: (error) => {
          console.error(error);
          toast.error("Failed to add the item to the order");
        },
      },
    );
    router.push("/shopkeeper/checkout");
  };

  const items = useMemo(() => {
    return (inventoryData?.data || []).filter(
      (item: InventoryItem) => item.type === "inventory",
    );
  }, [inventoryData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formForceType, setFormForceType] = useState<
    "inventory" | "sold" | undefined
  >(undefined);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [printLabelItem, setPrintLabelItem] = useState<InventoryItem | null>(
    null,
  );

  const filteredItems = useMemo(() => {
    return items.filter(
      (item: InventoryItem) =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.imeiNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  const stockItems = filteredItems;

  const totalValue = useMemo(() => {
    return items.reduce(
      (sum: number, item: InventoryItem) =>
        sum + getInventoryDisplayPrice(item),
      0,
    );
  }, [items]);

  const handleDelete = (id: string) => {
    deleteItem(id, {
      onSuccess: () => toast.success("Item deleted"),
      onError: () => toast.error("Delete failed"),
    });
  };

  const openCategoryForm = (category?: Category) => {
    setEditingCategory(category ?? null);
    setCategoryName(category?.name ?? "");
    setCategoryImageFile(null);
    setCategoryImagePreview(category ? getCategoryImageUrl(category) : "");
    setIsCategoryFormOpen(true);
  };

  const closeCategoryForm = () => {
    if (categoryImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(categoryImagePreview);
    }
    setIsCategoryFormOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImageFile(null);
    setCategoryImagePreview("");
  };

  const handleCategoryImageChange = (file: File | null) => {
    if (categoryImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(categoryImagePreview);
    }

    if (!file) {
      setCategoryImageFile(null);
      setCategoryImagePreview(
        editingCategory ? getCategoryImageUrl(editingCategory) : "",
      );
      return;
    }

    setCategoryImageFile(file);
    setCategoryImagePreview(URL.createObjectURL(file));
  };

  const handleCategorySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = {
      name: categoryName.trim(),
      image: categoryImageFile ?? undefined,
    };

    if (!input.name) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      updateCategory(
        { id: editingCategory._id, input },
        {
          onSuccess: (response) => {
            toast.success("Category updated successfully");
            if (selectedCategory?._id === editingCategory._id) {
              setSelectedCategory(response.data);
            }
            closeCategoryForm();
          },
          onError: () => toast.error("Category update failed"),
        },
      );
      return;
    }

    createCategory(input, {
      onSuccess: () => {
        toast.success("Category created successfully");
        closeCategoryForm();
      },
      onError: () => toast.error("Category creation failed"),
    });
  };

  const handleCategoryDelete = (category: Category) => {
    if (!window.confirm(`Delete "${category.name}" category?`)) return;

    deleteCategory(category._id, {
      onSuccess: () => {
        toast.success("Category deleted");
        if (selectedCategory?._id === category._id) {
          setSelectedCategory(null);
        }
      },
      onError: () => toast.error("Category delete failed"),
    });
  };

  if (!selectedCategory && isCategoriesLoading) return <InventorySkeleton />;
  if (selectedCategory && isInventoryLoading) return <InventorySkeleton />;
  if ((!selectedCategory && isCategoriesError) || isInventoryError)
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-500">
          Failed to load {selectedCategory ? "inventory" : "categories"}
        </h2>
        <p className="text-slate-500">
          Please check your connection or login again.
        </p>
      </div>
    );

  if (!selectedCategory) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Inventory Categories
              </h1>
              <p className="text-sm font-bold text-muted-foreground">
                {categories.length} categor
                {categories.length === 1 ? "y" : "ies"} available
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormForceType("inventory");
                  setIsFormOpen(true);
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-card border border-border px-5 text-sm font-black text-foreground shadow-sm transition hover:border-[#84CC16]/50 hover:bg-[#84CC16]/5 active:scale-95 cursor-pointer"
              >
                <Plus size={18} strokeWidth={3} />
                Add Item
              </button>
              <button
                onClick={() => openCategoryForm()}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-6 text-sm font-black text-white shadow-lg shadow-lime-500/20 transition hover:bg-[#76b813] active:scale-95 cursor-pointer"
              >
                <Plus size={18} strokeWidth={3} />
                Add Category
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {categories.length > 0 ? (
              categories.map((category, index) => {
                const categoryImageUrl = getCategoryImageUrl(category);

                return (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedCategory(category)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setSelectedCategory(category);
                      }
                    }}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-[#84CC16]/50 hover:shadow-lg"
                  >
                    <div className="relative h-40 bg-slate-50 dark:bg-slate-900">
                      {categoryImageUrl ? (
                        <Image
                          src={getCategoryImageSrc(categoryImageUrl)}
                          alt={category.name}
                          fill
                          sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1279px) 50vw, 25vw"
                          className="h-full w-full object-contain object-center p-3 transition duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <FolderOpen size={52} strokeWidth={1.8} />
                        </div>
                      )}
                      <div className="absolute right-3 top-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(event) => event.stopPropagation()}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:text-slate-900"
                              aria-label={`Manage ${category.name}`}
                            >
                              <MoreVertical size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl border-slate-100 p-2 shadow-xl"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onClick={() => openCategoryForm(category)}
                              className="flex items-center gap-2 p-3 font-bold text-xs rounded-lg cursor-pointer"
                            >
                              <Edit2 size={14} />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCategoryDelete(category)}
                              className="flex items-center gap-2 p-3 font-bold text-xs rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 size={14} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-black text-foreground">
                          {category.name}
                        </h2>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          Open inventory
                        </p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#84CC16]/10 text-[#84CC16]">
                        <Package size={18} strokeWidth={2.5} />
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full rounded-[28px] border border-dashed border-slate-200 bg-slate-50 py-20 text-center dark:border-slate-700 dark:bg-slate-900/40">
                <FolderOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h3 className="text-lg font-black text-foreground">
                  No categories found
                </h3>
                <p className="text-sm font-bold text-slate-500">
                  Create a category to organize inventory items.
                </p>
              </div>
            )}
          </div>

          <CategoryFormDialog
            isOpen={isCategoryFormOpen}
            category={editingCategory}
            name={categoryName}
            imagePreview={categoryImagePreview}
            isPending={isCreatingCategory || isUpdatingCategory}
            onNameChange={setCategoryName}
            onImageChange={handleCategoryImageChange}
            onClose={closeCategoryForm}
            onSubmit={handleCategorySubmit}
          />
          <InventoryFormModal
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingItem(null);
              setFormForceType(undefined);
            }}
            item={editingItem}
            forceType={formForceType}
            categoryId={undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* ── Top bar ── */}
        <div className="flex flex-col gap-6">
          {/* Title row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                {selectedCategory.name}
              </h1>
              <p className="text-sm font-bold text-muted-foreground">
                {items.length} {items.length === 1 ? "Item" : "Items"} in Stock
                - {formatCurrency(totalValue)} Total Revenue Potential
              </p>
            </div>

            {/* Action buttons — only on inventory tab */}
            {activeTab === "inventory" && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery("");
                    setActiveTab("inventory");
                  }}
                  className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 text-foreground shadow-sm transition hover:border-[#84CC16]/50 hover:bg-[#84CC16]/5 active:scale-95 cursor-pointer"
                  aria-label="Back to categories"
                >
                  <ArrowLeft size={18} strokeWidth={2.6} />
                  <span className="hidden text-sm font-black sm:inline">
                    Categories
                  </span>
                </button>
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-sm font-bold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#84CC16] focus:ring-[#84CC16]"
                  />
                </div>
                {stockItems.length > 0 && (
                  <button
                    onClick={() => {
                      exportInventoryToCsv(
                        stockItems,
                        `inventory-${new Date().toISOString().slice(0, 10)}.csv`,
                      );
                      toast.success(
                        `Exported ${stockItems.length} items to CSV`,
                      );
                    }}
                    className="flex shrink-0 items-center gap-2 px-4 py-3 bg-card border border-border text-foreground font-black rounded-xl hover:bg-accent transition shadow-sm active:scale-95 cursor-pointer text-xs"
                    title="Export currently filtered inventory as CSV"
                  >
                    <Download size={15} className="text-[#84CC16]" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setFormForceType("inventory");
                    setIsFormOpen(true);
                  }}
                  className="flex shrink-0 items-center gap-2 px-6 py-3 bg-[#84CC16] text-white font-black rounded-xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer text-xs sm:text-sm"
                >
                  <Plus size={18} strokeWidth={3} />
                  <span className="hidden sm:inline">Add Item</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            )}
          </div>

          {/* ── Tab pills ── */}
          <div className="mobile-scroll flex items-center gap-2 border-b border-border pb-0">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-t-xl transition cursor-pointer ${
                activeTab === "inventory"
                  ? "text-[#84CC16] bg-[#84CC16]/8 border-b-2 border-[#84CC16] -mb-px"
                  : "text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Package size={15} strokeWidth={2.5} />
              Inventory
            </button>
          </div>
        </div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "import-csv" ? (
            <motion.div
              key="import-csv"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              <ImportCsvTab />
            </motion.div>
          ) : (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              {/* Stock Grid */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {stockItems.length > 0 ? (
                  stockItems.map((item: InventoryItem, i: number) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative rounded-[28px] border border-border bg-card p-4 shadow-sm transition-all sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div className="relative h-32 w-full sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-slate-50 dark:bg-slate-900">
                          {getInventoryImageUrl(item) ? (
                            <Image
                              src={getInventoryImageUrl(item)}
                              alt={item.itemName}
                              fill
                              sizes="(max-width: 639px) calc(100vw - 4rem), 128px"
                              className="object-contain object-center p-3 transition-transform duration-500 group-hover:scale-105"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package size={40} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-[15px] font-black leading-tight text-foreground line-clamp-2">
                                {item.itemName}
                              </h3>
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                                {item.brand && (
                                  <span className="text-[11px] font-bold text-[#84CC16]">
                                    {item.brand}
                                  </span>
                                )}
                                {item.storage && (
                                  <span className="text-[11px] font-bold text-slate-400">
                                    • {item.storage}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="text-[11px] font-bold text-slate-400">
                                    • {item.color}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-bold text-[#94A3B8] mt-1 dark:text-gray-400">
                                {item.imeiNumber || item.sku || "No IMEI/SKU"}
                              </p>
                              {/* <p className="text-[10px] font-medium text-[#CBD5E1] line-clamp-1">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p> */}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="p-1.5 bg-gray-50 text-gray-400 hover:text-[#84CC16] hover:bg-[#84CC16]/10 rounded-lg transition cursor-pointer"
                              >
                                <Eye size={16} strokeWidth={2.5} />
                              </button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1.5 text-gray-400 hover:text-foreground transition cursor-pointer">
                                    <MoreVertical size={16} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="rounded-xl border-slate-100 p-2 shadow-xl"
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingItem(item);
                                      setFormForceType("inventory");
                                      setIsFormOpen(true);
                                    }}
                                    className="flex items-center gap-2 p-3 font-bold text-xs rounded-lg cursor-pointer"
                                  >
                                    <Edit2 size={14} />
                                    Edit Item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setPrintLabelItem(item);
                                    }}
                                    className="flex items-center gap-2 p-3 font-bold text-xs rounded-lg cursor-pointer"
                                  >
                                    <Printer size={14} />
                                    Print Label
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(item._id)}
                                    className="flex items-center gap-2 p-3 font-bold text-xs rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-500">
                              {item.currentState}
                            </span>
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#84CC16] text-white">
                              In Stock
                            </span>
                            <button
                              onClick={() => handleSell(item)}
                              className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-700 transition shadow shadow-red-500/20 active:scale-95 cursor-pointer"
                            >
                              Sell
                            </button>
                          </div>

                          <div className="flex items-end justify-between pt-2">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
                                Selling Price
                              </span>
                              <span className="text-lg font-black text-foreground truncate">
                                {formatCurrency(getInventoryDisplayPrice(item))}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap ml-2 shrink-0">
                              Qty : {item.quantity || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full rounded-[32px] border border-dashed border-border bg-surface py-20 text-center">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-foreground">
                      No items found
                    </h3>
                    <p className="text-sm font-bold text-muted-foreground">
                      Add your first item to get started
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedItem && (
            <InventoryDetailsModal
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </AnimatePresence>

        {/* Form Modals */}
        <InventoryFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
            setFormForceType(undefined);
          }}
          item={editingItem}
          forceType={formForceType}
          categoryId={selectedCategory._id}
        />
        <CategoryFormDialog
          isOpen={isCategoryFormOpen}
          category={editingCategory}
          name={categoryName}
          imagePreview={categoryImagePreview}
          isPending={isCreatingCategory || isUpdatingCategory}
          onNameChange={setCategoryName}
          onImageChange={handleCategoryImageChange}
          onClose={closeCategoryForm}
          onSubmit={handleCategorySubmit}
        />
        <PrintLabelModal
          isOpen={!!printLabelItem}
          onClose={() => setPrintLabelItem(null)}
          item={printLabelItem}
        />
      </div>
    </div>
  );
}

function CategoryFormDialog({
  isOpen,
  category,
  name,
  imagePreview,
  isPending,
  onNameChange,
  onImageChange,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  category: Category | null;
  name: string;
  imagePreview: string;
  isPending: boolean;
  onNameChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleGallerySelect = async (url: string) => {
    try {
      const response = await fetch(
        `/api/image-proxy?url=${encodeURIComponent(url)}`,
      );
      const blob = await response.blob();
      const file = new File([blob], `gallery-image.jpg`, { type: blob.type });
      onImageChange(file);
    } catch (error) {
      console.error("Failed to process gallery image", error);
      toast.error("Failed to load image from gallery.");
    } finally {
      setIsGalleryOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl border-border p-0">
          <DialogHeader className="border-b border-border px-6 py-5 text-left">
            <DialogTitle className="text-xl font-black text-foreground">
              {category ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Categories organize inventory before products are shown.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-5 p-6">
            <div className="space-y-2">
              <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-foreground">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FolderOpen className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder="Electronics"
                  className="h-12 rounded-xl border-border pl-11 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-foreground">
                Category Image
              </label>
              <div className="rounded-2xl border border-dashed border-border bg-surface p-4">
                {imagePreview ? (
                  <div
                    className="mb-4 h-40 rounded-xl bg-slate-50 bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url("${getCategoryImageSrc(imagePreview)}")`,
                    }}
                    aria-label="Selected category image preview"
                    role="img"
                  />
                ) : (
                  <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-card text-slate-300">
                    <ImageIcon size={40} strokeWidth={1.8} />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-card px-5 text-sm font-black text-foreground shadow-sm transition hover:bg-muted">
                    <ImageIcon size={16} />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        onImageChange(event.target.files?.[0] ?? null);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-black text-foreground shadow-sm transition hover:border-[#84CC16]/50 hover:bg-[#84CC16]/5 hover:text-[#84CC16]"
                  >
                    <Search size={16} />
                    Gallery
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => onImageChange(null)}
                      className="h-11 rounded-xl px-4 text-sm font-black text-muted-foreground transition hover:bg-card hover:text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-border px-5 text-sm font-black text-muted-foreground transition hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex h-11 min-w-28 items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-5 text-sm font-black text-white transition hover:bg-[#76b813] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {category ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleGallerySelect}
      />
    </>
  );
}
