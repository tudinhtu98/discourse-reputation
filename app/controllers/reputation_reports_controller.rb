# frozen_string_literal: true

class ReputationReportsController < ApplicationController
  def bulk
    reports = []

    hijack do
      params[:reports].each do |report_type, report_params|
        args = parse_params(report_params)


        report = nil
        report = Report.find_cached(report_type, args) if (report_params[:cache])

        if report
          reports << report
        else
          report = Report.find(report_type, args)
          Report.cache(report) if (report_params[:cache]) && report

          if report.blank?
            report = Report._get(report_type, args)
            report.error = :not_found
          end

          reports << report
        end
      end

      render_json_dump(reports: reports)
    end
  end

  def parse_params(report_params)
    begin
      start_date =
        (
          if report_params[:start_date].present?
            Time.parse(report_params[:start_date]).to_date
          else
            1.days.ago
          end
        ).beginning_of_day
      end_date =
        (
          if report_params[:end_date].present?
            Time.parse(report_params[:end_date]).to_date
          else
            start_date + 30.days
          end
        ).end_of_day
    rescue ArgumentError => e
      raise Discourse::InvalidParameters.new(e.message)
    end

    facets = nil
    facets = report_params[:facets].map { |s| s.to_s.to_sym } if Array === report_params[:facets]

    limit = nil
    if report_params.has_key?(:limit) && report_params[:limit].to_i > 0
      limit = report_params[:limit].to_i
    end

    filters = nil
    filters = report_params[:filters] if report_params.has_key?(:filters)

    { start_date: start_date, end_date: end_date, filters: filters, facets: facets, limit: limit }
  end
end
