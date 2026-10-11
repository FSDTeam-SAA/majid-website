import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteCategoryWarningModal } from "./DeleteCategoryWarningModal";
import type { Category } from "../../types";

const mockCategory: Category = {
  _id: "cat-123",
  name: "Smartphones",
  image: {
    url: "https://example.com/smartphone.jpg",
    public_id: "smartphones_1",
  },
};

describe("DeleteCategoryWarningModal", () => {
  it("renders category name and warning messages when open", () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    render(
      <DeleteCategoryWarningModal
        isOpen={true}
        category={mockCategory}
        isPending={false}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
    );

    expect(screen.getByText("Delete Category?")).toBeInTheDocument();
    expect(screen.getByText("Smartphones")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to delete this category\? This action cannot be undone\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Delete Category/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    render(
      <DeleteCategoryWarningModal
        isOpen={true}
        category={mockCategory}
        isPending={false}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it("calls onConfirm when Delete Category button is clicked", () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    render(
      <DeleteCategoryWarningModal
        isOpen={true}
        category={mockCategory}
        isPending={false}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Delete Category/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows deleting spinner and disables buttons when isPending is true", () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    render(
      <DeleteCategoryWarningModal
        isOpen={true}
        category={mockCategory}
        isPending={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
    );

    const deleteButton = screen.getByRole("button", {
      name: /Deleting\.\.\./i,
    });
    expect(deleteButton).toBeDisabled();

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    expect(cancelButton).toBeDisabled();
  });
});
