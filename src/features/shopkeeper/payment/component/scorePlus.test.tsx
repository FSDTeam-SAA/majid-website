import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ScorePlusButton from "./ScorePlusButton";
import ScoreReviewStatusBadge from "./ScoreReviewStatusBadge";

describe("ScorePlusButton", () => {
  it("renders the Score+ logo and send icon properly", () => {
    const handleClick = jest.fn();
    render(<ScorePlusButton onClick={handleClick} />);

    const img = screen.getByAltText("Score+");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/score-plus.png");

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe("ScoreReviewStatusBadge", () => {
  it("renders 'No review recorded' badge when status is none", () => {
    const handleBadgeClick = jest.fn();
    render(
      <ScoreReviewStatusBadge status="none" onClickBadge={handleBadgeClick} />,
    );

    expect(screen.getByText("No review recorded")).toBeInTheDocument();
    expect(screen.queryByText("View review")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(handleBadgeClick).toHaveBeenCalledTimes(1);
  });

  it("renders 'Review recorded' badge and View review link when status is recorded", () => {
    render(
      <ScoreReviewStatusBadge
        status="recorded"
        reviewUrl="https://g.page/r/test"
      />,
    );

    expect(screen.getByText("Review recorded")).toBeInTheDocument();
    const link = screen.getByText("View review");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "https://g.page/r/test");
  });
});
