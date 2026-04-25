import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NDAForm from "@/app/components/NDAForm";
import type { NDAFormData } from "@/app/lib/types";
import { baseData } from "../fixtures/nda";

const today = new Date().toISOString().split("T")[0];

// Blank slate for tests that need a clean form
const emptyData: NDAFormData = {
  purpose: "",
  effectiveDate: today,
  mndaTermType: "expires",
  mndaTermYears: "1",
  confidentialityTermType: "fixed",
  confidentialityTermYears: "1",
  governingLaw: "",
  jurisdiction: "",
  party1: { name: "", title: "", company: "", noticeAddress: "", date: today },
  party2: { name: "", title: "", company: "", noticeAddress: "", date: today },
};

describe("NDAForm", () => {
  it("renders all section headings", () => {
    render(<NDAForm data={emptyData} onChange={() => {}} />);
    expect(screen.getByText(/Agreement Details/i)).toBeInTheDocument();
    expect(screen.getByText(/MNDA Term/i)).toBeInTheDocument();
    expect(screen.getByText(/Term of Confidentiality/i)).toBeInTheDocument();
    expect(screen.getByText(/Governing Law & Jurisdiction/i)).toBeInTheDocument();
    expect(screen.getByText(/Signatories/i)).toBeInTheDocument();
  });

  describe("Purpose textarea", () => {
    it("renders with the current value", () => {
      render(<NDAForm data={baseData} onChange={() => {}} />);
      // Field does not link label→textarea via htmlFor/id, so query by current value
      expect(screen.getByDisplayValue("Evaluating a partnership.")).toBeInTheDocument();
    });

    it("calls onChange with updated purpose when typed into", () => {
      const handleChange = jest.fn();
      render(<NDAForm data={baseData} onChange={handleChange} />);
      const textarea = screen.getByDisplayValue("Evaluating a partnership.");
      fireEvent.change(textarea, { target: { value: "New purpose text" } });
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ purpose: "New purpose text" })
      );
    });
  });

  describe("MNDA Term radio buttons", () => {
    it("shows 'expires' radio selected by default", () => {
      render(<NDAForm data={emptyData} onChange={() => {}} />);
      expect(screen.getByRole("radio", { name: /Expires after a fixed number of years/i })).toBeChecked();
    });

    it("shows year number input when 'expires' is selected", () => {
      render(<NDAForm data={emptyData} onChange={() => {}} />);
      expect(screen.getAllByRole("spinbutton").length).toBeGreaterThanOrEqual(1);
    });

    it("calls onChange with mndaTermType='until-terminated' when that radio is selected", () => {
      const handleChange = jest.fn();
      render(<NDAForm data={emptyData} onChange={handleChange} />);
      fireEvent.click(screen.getByRole("radio", { name: /Continues until terminated/i }));
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ mndaTermType: "until-terminated" })
      );
    });

    it("hides MNDA year input when until-terminated is selected", () => {
      render(<NDAForm data={{ ...emptyData, mndaTermType: "until-terminated" }} onChange={() => {}} />);
      // Only the confidentiality spinbutton should remain
      expect(screen.getAllByRole("spinbutton")).toHaveLength(1);
    });

    it("calls onChange with updated mndaTermYears when MNDA year input is changed", () => {
      const handleChange = jest.fn();
      // confidentiality=perpetual so only one spinbutton exists → unambiguously the MNDA one
      render(<NDAForm data={{ ...emptyData, confidentialityTermType: "perpetual" }} onChange={handleChange} />);
      fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "3" } });
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ mndaTermYears: "3" })
      );
    });
  });

  describe("Term of Confidentiality radio buttons", () => {
    it("shows 'fixed' radio selected by default", () => {
      render(<NDAForm data={emptyData} onChange={() => {}} />);
      expect(screen.getByRole("radio", { name: /Fixed number of years from Effective Date/i })).toBeChecked();
    });

    it("calls onChange with confidentialityTermType='perpetual' when selected", () => {
      const handleChange = jest.fn();
      render(<NDAForm data={emptyData} onChange={handleChange} />);
      fireEvent.click(screen.getByRole("radio", { name: /In perpetuity/i }));
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ confidentialityTermType: "perpetual" })
      );
    });

    it("hides confidentiality year input when perpetual is selected", () => {
      render(<NDAForm data={{ ...emptyData, confidentialityTermType: "perpetual" }} onChange={() => {}} />);
      // Only the MNDA spinbutton remains
      expect(screen.getAllByRole("spinbutton")).toHaveLength(1);
    });
  });

  describe("Governing Law & Jurisdiction fields", () => {
    it("renders Governing Law input with placeholder", () => {
      render(<NDAForm data={emptyData} onChange={() => {}} />);
      expect(screen.getByPlaceholderText("Delaware")).toBeInTheDocument();
    });

    it("renders Jurisdiction input with placeholder", () => {
      render(<NDAForm data={emptyData} onChange={() => {}} />);
      expect(screen.getByPlaceholderText("New Castle, Delaware")).toBeInTheDocument();
    });

    it("calls onChange with updated governingLaw", () => {
      const handleChange = jest.fn();
      render(<NDAForm data={emptyData} onChange={handleChange} />);
      fireEvent.change(screen.getByPlaceholderText("Delaware"), { target: { value: "California" } });
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ governingLaw: "California" })
      );
    });

    it("calls onChange with updated jurisdiction", () => {
      const handleChange = jest.fn();
      render(<NDAForm data={emptyData} onChange={handleChange} />);
      fireEvent.change(screen.getByPlaceholderText("New Castle, Delaware"), { target: { value: "San Francisco, CA" } });
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ jurisdiction: "San Francisco, CA" })
      );
    });
  });

  describe("Party fields", () => {
    it("renders Party 1 and Party 2 labels", () => {
      render(<NDAForm data={emptyData} onChange={() => {}} />);
      expect(screen.getByText("Party 1")).toBeInTheDocument();
      expect(screen.getByText("Party 2")).toBeInTheDocument();
    });

    it("calls onChange with updated party1 name while preserving other party1 fields", () => {
      const handleChange = jest.fn();
      const data = { ...emptyData, party1: { name: "", title: "CEO", company: "Alpha", noticeAddress: "alice@alpha.com", date: today } };
      render(<NDAForm data={data} onChange={handleChange} />);
      fireEvent.change(screen.getAllByPlaceholderText("Jane Smith")[0], { target: { value: "Alice Smith" } });
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          party1: expect.objectContaining({ name: "Alice Smith", title: "CEO", company: "Alpha" }),
        })
      );
    });

    it("calls onChange with updated party2 name without affecting party1", () => {
      const handleChange = jest.fn();
      render(<NDAForm data={emptyData} onChange={handleChange} />);
      fireEvent.change(screen.getAllByPlaceholderText("Jane Smith")[1], { target: { value: "Bob Jones" } });
      const callArg = handleChange.mock.calls[0][0] as NDAFormData;
      expect(callArg.party2.name).toBe("Bob Jones");
      expect(callArg.party1.name).toBe("");
    });
  });
});
