defmodule LimsClientTest do
  use ExUnit.Case
  doctest LimsClient
  import Tesla.Mock

  setup do
    mock(fn
      %{method: :get} ->
        %Tesla.Env{
          status: 200,
          body: [
            %{
              "igoId" => "06555_A_555",
              "cmoSampleName" => "C-69555-L555-d",
              "sampleName" => "MSK-MB-0555-CF1-msk555555-p",
              "cmoSampleClass" => "Unknown Tumor",
              "cmoPatientId" => "C-69D8HW",
              "investigatorSampleId" => "MSK-MB-0555-CF1-msk555555-p",
              "oncoTreeCode" => "BREAST",
              "tumorOrNormal" => "Tumor",
              "tissueLocation" => "",
              "specimenType" => "cfDNA",
              "sampleOrigin" => "Whole Blood",
              "preservation" => "EDTA-Streck",
              "collectionYear" => "",
              "sex" => "F",
              "species" => "Human",
              "cfDNA2dBarcode" => "803555551",
              "baitSet" => "MSK-ACCESS-v1_0-probesAllwFP_hg37_sort-BAITS",
              "qcReports" => [
                %{
                  "qcReportType" => "LIBRARY",
                  "IGORecommendation" => "Passed",
                  "comments" => "",
                  "investigatorDecision" => "Continue processing"
                }
              ],
              "libraries" => [
                %{
                  "barcodeId" => "IDTdual555",
                  "barcodeIndex" => "CTTGTCGA-GAACATCG",
                  "libraryIgoId" => "06555_A_555_1_1",
                  "libraryVolume" => 35,
                  "libraryConcentrationNgul" => 57,
                  "dnaInputNg" => 18.25,
                  "captureConcentrationNm" => "8.771929825",
                  "captureInputNg" => "500.0000000250001",
                  "captureName" => "Pool-55555_AG-D4_1",
                  "runs" => [
                    %{
                      "runMode" => "NovaSeq S4",
                      "runId" => "DIANA_5555",
                      "flowCellId" => "H73G55555",
                      "readLength" => "101/8/8/101",
                      "runDate" => "2020-02-20",
                      "flowCellLanes" => [
                        1,
                        2,
                        3,
                        4
                      ],
                      "fastqs" => [
                        "/path/to/Sample_MSK-MB-0104-CF1-msk5002913c-p_IGO_06555_A_555/MSK-MB-0104-CF1-msk5002913c-p_IGO_06555_A_555_S39_R1_001.fastq.gz",
                        "/path/to/Sample_MSK-MB-0104-CF1-msk5002913c-p_IGO_06555_A_555/MSK-MB-0104-CF1-msk5002913c-p_IGO_06555_A_555_S39_R2_001.fastq.gz"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
    end)

    :ok
  end
end
